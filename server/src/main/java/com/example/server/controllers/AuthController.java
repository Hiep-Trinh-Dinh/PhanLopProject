package com.example.server.controllers;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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

    @Value("${app.secure:true}")
    private boolean secureCookie;

    @Value("${jwt.cookie.expiration:604800}") // 7 ngày
    private int cookieExpiration;

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
            return new ResponseEntity<>("Thiếu email hoặc code trong request.", HttpStatus.BAD_REQUEST);
        }
    
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>("Email không tồn tại.", HttpStatus.BAD_REQUEST);
        }
    
        if (user.getIsEmailVerified()) {
            return new ResponseEntity<>("Tài khoản đã được xác minh trước đó.", HttpStatus.OK);
        }
    
        Verification verification = user.getVerification();
        if (verification.getExpiryDate().isBefore(LocalDateTime.now())) {
            return new ResponseEntity<>("Mã xác minh đã hết hạn.", HttpStatus.BAD_REQUEST);
        }
    
        if (!verification.getCode().equals(code)) {
            return new ResponseEntity<>("Mã xác minh không đúng.", HttpStatus.BAD_REQUEST);
        }
    
        user.setIsEmailVerified(true);
        user.setVerification(null); // Xóa mã xác minh sau khi xác minh thành công
        userRepository.save(user);
    
        return new ResponseEntity<>("Xác minh thành công! Bạn có thể đăng nhập.", HttpStatus.OK);
    }

    @SuppressWarnings("null")
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(
        @Valid @RequestBody LoginRequest loginRequest,
        HttpServletResponse response
    ) throws UserException {
        // Xác thực người dùng
        Authentication authentication = authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        
        // Kiểm tra email đã xác minh
        User user = userRepository.findByEmail(loginRequest.getEmail());
        if (user != null && !user.getIsEmailVerified()) {
            throw new UserException("Vui lòng xác minh email trước khi đăng nhập.");
        }
        
        // Tạo token và cookie
        String token = jwtProvider.generateToken(authentication);
        setJwtCookie(response, token);
        
        // Cập nhật trạng thái user
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
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        clearJwtCookie(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(
        @CookieValue(name = "jwt", required = false) String token
    ) {
        if (token == null || !jwtProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = jwtProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(UserDtoMapper.toUserDto(user));
    }

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(cookieExpiration);
        response.addCookie(cookie);
    }

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}