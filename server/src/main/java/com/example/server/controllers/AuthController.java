package com.example.server.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.config.JwtProvider;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.models.Verification;
import com.example.server.repositories.UserRepository;
import com.example.server.responses.AuthResponse;
import com.example.server.services.CustomUserDetailsServerImplementation;

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

    @RequestMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(@Valid @RequestBody User user) throws UserException {

        String email = user.getEmail();
        String password = user.getPassword();
        String fullName = user.getFullName();
        String birthDate = user.getBirthDate();

        User userExists = userRepository.findByEmail(email);

        if (userExists != null) {
            throw new UserException("Người dùng với email " + email + " đã tồn tại");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setFullName(fullName);
        newUser.setBirthDate(birthDate);
        newUser.setVerification(new Verification());

        userRepository.save(newUser);

        UserDetails userDetails = customUserDetailsServerImplementation.loadUserByUsername(email);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);

        AuthResponse res = new AuthResponse(token, true); 

        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    @RequestMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody User user) throws UserException {

        String username = user.getEmail();
        String password = user.getPassword();

        Authentication authentication = authenticate(username, password);

        AuthResponse res = new AuthResponse(jwtProvider.generateToken(authentication), true);
        
        return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
    }
    

    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = customUserDetailsServerImplementation.loadUserByUsername(username);
        
        if(userDetails == null) {
            throw new BadCredentialsException("User không tồn tại");
        }

        if(!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Mật khẩu không đúng");
        }
        
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }
}
