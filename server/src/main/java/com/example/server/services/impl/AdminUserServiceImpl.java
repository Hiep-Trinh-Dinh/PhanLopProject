package com.example.server.services.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.server.dto.AdminUserDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.repositories.UserRepository;
import com.example.server.services.AdminUserService;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserServiceImpl.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public boolean isAdmin(User user) {
        if (user == null) {
            logger.warn("User is null when checking admin status");
            return false;
        }
        boolean isAdmin = user.isAdmin();
        if (isAdmin) {
            logger.info("User {} is identified as admin", user.getEmail());
        }
        return isAdmin;
    }

    @Override
    public Page<AdminUserDto> findAllUsers(String query, String status, Pageable pageable) {
        Page<User> usersPage;
        
        if (query != null && !query.isBlank()) {
            if (!"all".equals(status)) {
                boolean isActive = "active".equals(status);
                usersPage = userRepository.findByNameOrEmailAndStatus(query, isActive, pageable);
            } else {
                usersPage = userRepository.findByNameOrEmail(query, pageable);
            }
        } else {
            if (!"all".equals(status)) {
                boolean isActive = "active".equals(status);
                usersPage = userRepository.findByIsActive(isActive, pageable);
            } else {
                usersPage = userRepository.findAll(pageable);
            }
        }
        
        List<AdminUserDto> userDtos = usersPage.getContent().stream()
                .map(AdminUserDto::fromEntity)
                .collect(Collectors.toList());
        
        return new PageImpl<>(userDtos, pageable, usersPage.getTotalElements());
    }

    @Override
    public AdminUserDto findUserDtoById(Long userId) throws UserException {
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new UserException("Không tìm thấy người dùng với ID: " + userId, HttpStatus.NOT_FOUND);
        }
        return AdminUserDto.fromEntity(user);
    }
    
    @Override
    public User findUserById(Long userId) throws UserException {
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new UserException("Không tìm thấy người dùng với ID: " + userId, HttpStatus.NOT_FOUND);
        }
        return user;
    }

    @Override
    @Transactional
    public AdminUserDto createUser(AdminUserDto userDto) throws UserException {
        if (userDto.getEmail() == null || userDto.getEmail().isBlank()) {
            throw new UserException("Email không được để trống", HttpStatus.BAD_REQUEST);
        }
        
        if (userDto.getFirstName() == null || userDto.getFirstName().isBlank()) {
            throw new UserException("Tên không được để trống", HttpStatus.BAD_REQUEST);
        }
        
        if (userDto.getLastName() == null || userDto.getLastName().isBlank()) {
            throw new UserException("Họ không được để trống", HttpStatus.BAD_REQUEST);
        }
        
        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            throw new UserException("Mật khẩu không được để trống", HttpStatus.BAD_REQUEST);
        }
        
        if (userRepository.findByEmail(userDto.getEmail()) != null) {
            throw new UserException("Email đã được sử dụng", HttpStatus.CONFLICT);
        }
        
        User newUser = new User();
        newUser.setFirstName(userDto.getFirstName());
        newUser.setLastName(userDto.getLastName());
        newUser.setEmail(userDto.getEmail());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        newUser.setIsActive(true);
        newUser.setFriends(new ArrayList<>());
        
        if (userDto.getImage() != null) {
            newUser.setImage(userDto.getImage());
        } else {
            newUser.setImage("/placeholder-user.jpg");
        }
        
        if (userDto.getPhone() != null) {
            newUser.setPhone(userDto.getPhone());
        }
        
        newUser.setIsEmailVerified(false);
        newUser.setPostsCount(0);
        newUser.setAdmin(false); // Đảm bảo người dùng mới không phải admin
        
        User savedUser = userRepository.save(newUser);
        
        return AdminUserDto.fromEntity(savedUser);
    }

    @Override
    @Transactional
    public AdminUserDto updateUser(Long userId, AdminUserDto userDto) throws UserException {
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new UserException("Không tìm thấy người dùng với ID: " + userId, HttpStatus.NOT_FOUND);
        }
        
        if (userDto.getFirstName() != null && !userDto.getFirstName().isBlank()) {
            user.setFirstName(userDto.getFirstName());
        }
        
        if (userDto.getLastName() != null && !userDto.getLastName().isBlank()) {
            user.setLastName(userDto.getLastName());
        }
        
        if (userDto.getImage() != null) {
            user.setImage(userDto.getImage());
        }
        
        if (userDto.getPhone() != null) {
            user.setPhone(userDto.getPhone());
        }
        
        if (userDto.getEmail() != null && !userDto.getEmail().equals(user.getEmail())) {
            if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
                throw new UserException("Không thể thay đổi email đã xác thực", HttpStatus.BAD_REQUEST);
            }
            
            if (userRepository.findByEmail(userDto.getEmail()) != null) {
                throw new UserException("Email đã được sử dụng", HttpStatus.CONFLICT);
            }
            
            user.setEmail(userDto.getEmail());
            user.setIsEmailVerified(false);
        }
        
        if (userDto.getPassword() != null && !userDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        
        return AdminUserDto.fromEntity(updatedUser);
    }

    @Override
    @Transactional
    public AdminUserDto toggleUserLock(Long userId, boolean lock) throws UserException {
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new UserException("Không tìm thấy người dùng với ID: " + userId, HttpStatus.NOT_FOUND);
        }
        
        if (user.isAdmin() && lock) {
            throw new UserException("Không thể khóa tài khoản admin", HttpStatus.BAD_REQUEST);
        }
        
        user.setIsActive(!lock);
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        
        return AdminUserDto.fromEntity(updatedUser);
    }
}