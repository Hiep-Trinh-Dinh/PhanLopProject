package com.example.server.controllers;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.server.config.JwtProvider;
import com.example.server.dto.UserDto;
import com.example.server.exception.UserException;
import com.example.server.mapper.UserDtoMapper;
import com.example.server.models.User;
import com.example.server.models.Verification;
import com.example.server.repositories.UserRepository;
import com.example.server.requests.LoginRequest;
import com.example.server.requests.SignupRequest;
import com.example.server.responses.AuthResponse;
import com.example.server.services.CustomUserDetailsServerImplementation;
import com.example.server.services.EmailService;
import com.example.server.services.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private CustomUserDetailsServerImplementation customUserDetailsServerImplementation;

    @Autowired
    private EmailService emailService;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private UserDtoMapper userDtoMapper;

    @Value("${app.secure:true}")
    private boolean secureCookie;

    @Value("${jwt.cookie.expiration:604800}") // 7 ngày (giây)
    private int cookieExpiration;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private static final String COOKIE_NAME = "auth_token";
    private static final String BLACKLIST_PREFIX = "blacklist_token:";
    private static final String RESET_TOKEN_PREFIX = "reset_token:";
    private static final long RESET_TOKEN_EXPIRY = 5 * 60 ; 

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(@Valid @RequestBody SignupRequest signupRequest) throws UserException {
        String email = signupRequest.getEmail();
        if (userRepository.findByEmail(email) != null) {
            throw new UserException("Email " + email + " đã được sử dụng.");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        newUser.setFirstName(signupRequest.getFirstName());
        newUser.setLastName(signupRequest.getLastName());
        newUser.setBirthDate(signupRequest.getBirthDate());

        if (signupRequest.getGender() != null) {
            try {
                newUser.setGender(User.Gender.fromFrontendValue(signupRequest.getGender()));
            } catch (IllegalArgumentException e) {
                throw new UserException("Giới tính không hợp lệ: " + signupRequest.getGender());
            }
        }

        newUser.setVerification(new Verification());
        userRepository.save(newUser);

        emailService.sendVerificationEmail(email, newUser.getVerification().getCode());

        return new ResponseEntity<>(
            new AuthResponse("Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác minh.", true),
            HttpStatus.CREATED
        );
    }

    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || code == null) {
            return new ResponseEntity<>("Thiếu email hoặc code.", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>("Email không tồn tại.", HttpStatus.BAD_REQUEST);
        }

        if (user.getIsEmailVerified()) {
            return new ResponseEntity<>("Tài khoản đã được xác minh.", HttpStatus.OK);
        }

        Verification verification = user.getVerification();
        if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
            return new ResponseEntity<>("Mã xác minh đã hết hạn.", HttpStatus.BAD_REQUEST);
        }

        if (!verification.getCode().equals(code)) {
            return new ResponseEntity<>("Mã xác minh không đúng.", HttpStatus.BAD_REQUEST);
        }

        user.setIsEmailVerified(true);
        user.setVerification(null);
        userRepository.save(user);

        return new ResponseEntity<>("Xác minh thành công!", HttpStatus.OK);
    }

    @SuppressWarnings("null")
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(
        @Valid @RequestBody LoginRequest loginRequest,
        HttpServletResponse response
    ) throws UserException {
        // Xóa thông tin xác thực cũ
        SecurityContextHolder.clearContext();

        // Xác thực người dùng
        Authentication authentication = authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        
        // Lấy thông tin người dùng
        User user = userRepository.findByEmail(loginRequest.getEmail());
        
        // Kiểm tra email đã xác minh
        if (user != null && !user.getIsEmailVerified()) {
            throw new UserException("Vui lòng xác minh email trước khi đăng nhập.");
        }
        
        // Kiểm tra tài khoản có bị khóa không
        if (user != null && !user.getIsActive()) {
            throw new UserException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.");
        }

        // Tạo token mới
        String token = jwtProvider.generateToken(authentication);
        setJwtCookie(response, token);

        // Cập nhật thời gian đăng nhập
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);

        // Cập nhật trạng thái online
        userService.updateOnlineStatus(user.getId(), 1);

        return ResponseEntity.ok(new AuthResponse("Đăng nhập thành công", true));
    }

    private Authentication authenticate(String username, String password) throws UserException {
        UserDetails userDetails = customUserDetailsServerImplementation.loadUserByUsername(username);
        if (userDetails == null) {
            throw new UserException("Email không tồn tại.");
        }
        
        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new UserException("Mật khẩu không đúng.");
        }
        
        // Kiểm tra tài khoản có bị khóa không (nếu cần thiết)
        User user = userRepository.findByEmail(username);
        if (user != null && !user.getIsActive()) {
            throw new UserException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.");
        }
        
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) {
        // Xóa thông tin xác thực
        SecurityContextHolder.clearContext();

        if (token != null && jwtProvider.validateToken(token)) {
            // Lấy email từ token
            String email = jwtProvider.getEmailFromToken(token);
            User user = userRepository.findByEmail(email);
            
            if (user != null) {
                // Cập nhật trạng thái offline
                userService.updateOnlineStatus(user.getId(), 0);
            }
            
            // Thêm token vào danh sách đen
            redisTemplate.opsForValue().set(
                BLACKLIST_PREFIX + token,
                "true",
                cookieExpiration,
                TimeUnit.SECONDS
            );
        }

        // Xóa cookie
        clearJwtCookie(response);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) {
            return new ResponseEntity<>(new AuthResponse("Thiếu email.", false), HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>(new AuthResponse("Email không tồn tại.", false), HttpStatus.BAD_REQUEST);
        }

        // Tạo token reset mật khẩu
        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
            RESET_TOKEN_PREFIX + resetToken,
            email,
            RESET_TOKEN_EXPIRY,
            TimeUnit.SECONDS
        );

        // Tạo liên kết reset
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        // Gửi email
        emailService.sendResetPasswordEmail(email, resetLink);

        return new ResponseEntity<>(
            new AuthResponse("Đã gửi liên kết reset mật khẩu đến email của bạn.", true),
            HttpStatus.OK
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null) {
            return new ResponseEntity<>(new AuthResponse("Thiếu token hoặc mật khẩu mới.", false), HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra token trong Redis
        String email = redisTemplate.opsForValue().get(RESET_TOKEN_PREFIX + token);
        if (email == null) {
            return new ResponseEntity<>(new AuthResponse("Token không hợp lệ hoặc đã hết hạn.", false), HttpStatus.BAD_REQUEST);
        }

        // Tìm user
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>(new AuthResponse("Người dùng không tồn tại.", false), HttpStatus.BAD_REQUEST);
        }

        // Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Xóa token khỏi Redis
        redisTemplate.delete(RESET_TOKEN_PREFIX + token);

        return new ResponseEntity<>(
            new AuthResponse("Đặt lại mật khẩu thành công.", true),
            HttpStatus.OK
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) {
        // Kiểm tra token
        if (token == null || !jwtProvider.validateToken(token) || isTokenBlacklisted(token)) {
            clearJwtCookie(response);
            setNoCacheHeaders(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Lấy email từ token
        String email = jwtProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            clearJwtCookie(response);
            setNoCacheHeaders(response);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        // Kiểm tra tài khoản có bị khóa không
        if (!user.getIsActive()) {
            clearJwtCookie(response);
            setNoCacheHeaders(response);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Ngăn cache
        setNoCacheHeaders(response);
        return ResponseEntity.ok(userDtoMapper.toUserDto(user));
    }

    private boolean isTokenBlacklisted(String token) {
        return redisTemplate.opsForValue().get(BLACKLIST_PREFIX + token) != null;
    }

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(cookieExpiration);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Xóa cookie
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void setNoCacheHeaders(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
    }
}