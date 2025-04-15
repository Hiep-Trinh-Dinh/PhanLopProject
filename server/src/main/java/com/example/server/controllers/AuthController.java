package com.example.server.controllers;

import java.time.LocalDateTime;
import java.util.Map;
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

    @Value("${app.secure:true}")
    private boolean secureCookie;

    @Value("${jwt.cookie.expiration:604800}") // 7 ngày (giây)
    private int cookieExpiration;

    private static final String COOKIE_NAME = "auth_token";
    private static final String BLACKLIST_PREFIX = "blacklist_token:";

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
        
        // Kiểm tra email đã xác minh
        User user = userRepository.findByEmail(loginRequest.getEmail());
        if (user != null && !user.getIsEmailVerified()) {
            throw new UserException("Vui lòng xác minh email trước khi đăng nhập.");
        }

        // Tạo token mới
        String token = jwtProvider.generateToken(authentication);
        setJwtCookie(response, token);

        // Cập nhật thời gian đăng nhập
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse("Đăng nhập thành công", true));
    }

    private Authentication authenticate(String username, String password) throws UserException {
        UserDetails userDetails = customUserDetailsServerImplementation.loadUserByUsername(username);
        if (userDetails == null) {
            throw new UserException("Email không tồn tại.");
        }
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new UserException("Mật khẩu không đúng.");
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

        if (token != null) {
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

        // Ngăn cache
        setNoCacheHeaders(response);
        return ResponseEntity.ok(UserDtoMapper.toUserDto(user));
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