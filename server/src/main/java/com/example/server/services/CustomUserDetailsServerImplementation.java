package com.example.server.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.server.models.User;
import com.example.server.repositories.UserRepository;

@Service
public class CustomUserDetailsServerImplementation implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username);

        if (user == null || user.getLogin_with_Google()) {
            throw new UsernameNotFoundException("Không tìm thấy user với email: " + username);
        }
        
        // Kiểm tra tài khoản có bị khóa không
        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("Tài khoản đã bị khóa: " + username);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();

        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);
    }
}