package com.example.server.utils;

import com.example.server.models.User;
import com.example.server.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    
    private static UserRepository userRepository;
    
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        SecurityUtils.userRepository = userRepository;
    }
    
    /**
     * Gets the currently authenticated user from the SecurityContext
     * @return User object for the authenticated user
     * @throws RuntimeException if no user is authenticated or the user cannot be found
     */
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("No authenticated user found");
        }
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            throw new RuntimeException("User not found for email: " + email);
        }
        
        return user;
    }
} 