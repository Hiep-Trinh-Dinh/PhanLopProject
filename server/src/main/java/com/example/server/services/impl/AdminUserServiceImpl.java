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
        // Xác định admin chỉ dựa vào email có đuôi @admin.com hoặc admin@phanlop.com
        if (user.getEmail() != null) {
            boolean isAdminEmail = user.getEmail().endsWith("@admin.com") || 
                               user.getEmail().equals("admin@phanlop.com");
            
            if (isAdminEmail) {
                logger.info("Xác định tài khoản {} là admin", user.getEmail());
                return true;
            }
        }
        return false;
        
        /* Logic cũ - tạm thời bỏ qua
        // TODO: Chỉ dùng cho môi trường phát triển - Cần xóa trước khi triển khai production
        return true;
        
        // Tạm thời xác định admin dựa vào email
        if (user.getEmail() != null) {
            return user.getEmail().endsWith("@admin.com") || 
                   user.getEmail().equals("admin@phanlop.com");
        }
        return false;
        */
    }

    @Override
    public Page<AdminUserDto> findAllUsers(String query, String status, Pageable pageable) {
        Page<User> usersPage;
        
        // Kiểm tra và xác định kiểu tìm kiếm/lọc
        if (query != null && !query.isBlank()) {
            // Tìm kiếm theo query
            if (!"all".equals(status)) {
                // Kết hợp với lọc theo status
                boolean isActive = "active".equals(status);
                usersPage = userRepository.findByNameOrEmailAndStatus(query, isActive, pageable);
            } else {
                // Chỉ tìm kiếm, không lọc status
                usersPage = userRepository.findByNameOrEmail(query, pageable);
            }
        } else {
            // Không có query tìm kiếm
            if (!"all".equals(status)) {
                // Chỉ lọc theo status
                boolean isActive = "active".equals(status);
                usersPage = userRepository.findByIsActive(isActive, pageable);
            } else {
                // Không tìm kiếm, không lọc - lấy tất cả
                usersPage = userRepository.findAll(pageable);
            }
        }
        
        // Chuyển đổi từ User sang AdminUserDto
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
        // Kiểm tra thông tin bắt buộc
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
        
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.findByEmail(userDto.getEmail()) != null) {
            throw new UserException("Email đã được sử dụng", HttpStatus.CONFLICT);
        }
        
        // Tạo user mới
        User newUser = new User();
        newUser.setFirstName(userDto.getFirstName());
        newUser.setLastName(userDto.getLastName());
        newUser.setEmail(userDto.getEmail());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        newUser.setIsActive(true);
        newUser.setFriends(new ArrayList<>());
        
        // Thiết lập các giá trị mặc định
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
        
        // Lưu user
        User savedUser = userRepository.save(newUser);
        
        // Trả về DTO
        return AdminUserDto.fromEntity(savedUser);
    }

    @Override
    @Transactional
    public AdminUserDto updateUser(Long userId, AdminUserDto userDto) throws UserException {
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new UserException("Không tìm thấy người dùng với ID: " + userId, HttpStatus.NOT_FOUND);
        }
        
        // Cập nhật thông tin
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
        
        // Email không được thay đổi nếu đã xác thực
        if (userDto.getEmail() != null && !userDto.getEmail().equals(user.getEmail())) {
            if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
                throw new UserException("Không thể thay đổi email đã xác thực", HttpStatus.BAD_REQUEST);
            }
            
            // Kiểm tra email đã tồn tại chưa
            if (userRepository.findByEmail(userDto.getEmail()) != null) {
                throw new UserException("Email đã được sử dụng", HttpStatus.CONFLICT);
            }
            
            user.setEmail(userDto.getEmail());
            user.setIsEmailVerified(false);
        }
        
        // Cập nhật mật khẩu nếu có
        if (userDto.getPassword() != null && !userDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        
        // Lưu cập nhật
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
        
        // Nếu là admin thì không được khóa
        if (isAdmin(user) && lock) {
            throw new UserException("Không thể khóa tài khoản admin", HttpStatus.BAD_REQUEST);
        }
        
        // Cập nhật trạng thái
        user.setIsActive(!lock);
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        
        return AdminUserDto.fromEntity(updatedUser);
    }
} 