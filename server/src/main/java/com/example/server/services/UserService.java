// src/main/java/com/example/server/services/UserService.java
package com.example.server.services;

import com.example.server.models.Users;
import com.example.server.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    //Lưu user vào data
    public Users createUser(Users user) {
        return userRepository.save(user);
    }

    //Lấy danh sách user
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }
}