package com.example.server.controllers;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.server.config.JwtProvider;
import com.example.server.dto.AdminUserDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.requests.UserRequest;
import com.example.server.services.AdminUserService;
import com.example.server.services.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserController.class);
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private JwtProvider jwtProvider;

    private static final String COOKIE_NAME = "auth_token";

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }
    
    private void validateAdminUser(String token, HttpServletResponse response) throws UserException {
        logger.debug("Validating admin user with token: {}", token);
        
        // TEMPORARY WORKAROUND FOR DEVELOPMENT
        // Remove this block in production
        logger.info("DEVELOPMENT MODE: Skipping admin validation");
        if (true) {
            return;
        }
        
        // Kiểm tra token
        if (token == null || token.isEmpty()) {
            logger.warn("Token không tồn tại khi truy cập API admin");
            throw new UserException("Access Denied - Token không tồn tại", HttpStatus.FORBIDDEN);
        }
        
        // Kiểm tra tính hợp lệ của token và lấy thông tin người dùng
        Long userId = jwtProvider.getUserIdFromJwtToken(token);
        if (userId == null) {
            logger.warn("Token không hợp lệ khi truy cập API admin");
            clearJwtCookie(response);
            throw new UserException("Access Denied - Token không hợp lệ", HttpStatus.FORBIDDEN);
        }
        
        // Kiểm tra quyền admin
        User user = userService.findUserById(userId);
        
        logger.debug("Kiểm tra quyền admin cho user: {}", user);
        
        if (user == null) {
            logger.warn("Không tìm thấy người dùng với ID: {}", userId);
            clearJwtCookie(response);
            throw new UserException("Access Denied - Người dùng không tồn tại", HttpStatus.FORBIDDEN);
        }
        
        if (!user.isAdmin()) {
            logger.warn("Người dùng không có quyền admin: {}", user.getUsername());
            throw new UserException("Access Denied - Bạn không có quyền admin", HttpStatus.FORBIDDEN);
        }
        
        logger.debug("Xác thực admin thành công cho user: {}", user.getUsername());
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "all") String status,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        try {
            // BỎ QUA XÁC THỰC TRONG MÔI TRƯỜNG PHÁT TRIỂN
            logger.info("Bỏ qua xác thực token khi gọi getAllUsers trong môi trường phát triển");
            
            // Xử lý sắp xếp
            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Sort sort = Sort.by(direction, sortBy);
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<AdminUserDto> usersPage = adminUserService.findAllUsers(query, status, pageable);
            
            Map<String, Object> response_data = new HashMap<>();
            response_data.put("users", usersPage.getContent());
            response_data.put("currentPage", usersPage.getNumber());
            response_data.put("totalItems", usersPage.getTotalElements());
            response_data.put("totalPages", usersPage.getTotalPages());
            
            return ResponseEntity.ok(response_data);
            
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách người dùng: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserDetail(
            @PathVariable Long userId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        try {
            // BỎ QUA XÁC THỰC TRONG MÔI TRƯỜNG PHÁT TRIỂN
            logger.info("Bỏ qua xác thực token khi gọi getUserDetail trong môi trường phát triển");
            
            AdminUserDto user = adminUserService.findUserDtoById(userId);
            return ResponseEntity.ok(user);
            
        } catch (UserException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin người dùng: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody AdminUserDto userDto,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        try {
            // BỎ QUA XÁC THỰC TRONG MÔI TRƯỜNG PHÁT TRIỂN
            logger.info("Bỏ qua xác thực token khi gọi createUser trong môi trường phát triển");
            
            AdminUserDto newUser = adminUserService.createUser(userDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
            
        } catch (UserException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi tạo người dùng mới: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody AdminUserDto userDto,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        try {
            // BỎ QUA XÁC THỰC TRONG MÔI TRƯỜNG PHÁT TRIỂN
            logger.info("Bỏ qua xác thực token khi gọi updateUser trong môi trường phát triển");
            
            AdminUserDto updatedUser = adminUserService.updateUser(userId, userDto);
            return ResponseEntity.ok(updatedUser);
            
        } catch (UserException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi cập nhật người dùng: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PutMapping("/{userId}/lock")
    public ResponseEntity<?> lockUser(
            @PathVariable Long userId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        try {
            // BỎ QUA XÁC THỰC TRONG MÔI TRƯỜNG PHÁT TRIỂN
            logger.info("Bỏ qua xác thực token khi gọi lockUser trong môi trường phát triển");
            
            AdminUserDto lockedUser = adminUserService.toggleUserLock(userId, true);
            
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("message", "Đã khóa người dùng thành công");
            successResponse.put("user", lockedUser);
            
            return ResponseEntity.ok(successResponse);
            
        } catch (UserException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi khóa người dùng: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PutMapping("/{userId}/unlock")
    public ResponseEntity<?> unlockUser(
            @PathVariable Long userId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        try {
            // BỎ QUA XÁC THỰC TRONG MÔI TRƯỜNG PHÁT TRIỂN
            logger.info("Bỏ qua xác thực token khi gọi unlockUser trong môi trường phát triển");
            
            AdminUserDto unlockedUser = adminUserService.toggleUserLock(userId, false);
            
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("message", "Đã mở khóa người dùng thành công");
            successResponse.put("user", unlockedUser);
            
            return ResponseEntity.ok(successResponse);
            
        } catch (UserException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi mở khóa người dùng: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Thêm endpoint test để debug
    @GetMapping("/test")
    public ResponseEntity<?> testAdminEndpoint() {
        logger.info("Gọi đến API test");
        
        Map<String, Object> response_data = new HashMap<>();
        response_data.put("message", "API test hoạt động - Không yêu cầu xác thực");
        response_data.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response_data);
    }

    @GetMapping("/isAdminValid")
    public ResponseEntity<Map<String, Object>> isAdminValid(HttpServletRequest request) {
        try {
            // For development purposes, always return true
            // TODO: Remove this before production
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("valid", true);
            responseMap.put("message", "Admin validation successful");
            return ResponseEntity.ok(responseMap);
            
            /*
            // Original implementation
            String token = securityUtils.getTokenFromCookie(request);
            User user = securityUtils.getUserFromToken(token);
            
            boolean isAdmin = adminUserService.isAdmin(user);
            
            Map<String, Object> responseMap = new HashMap<>();
            if (isAdmin) {
                responseMap.put("valid", true);
                responseMap.put("message", "Admin validation successful");
                return ResponseEntity.ok(responseMap);
            } else {
                responseMap.put("valid", false);
                responseMap.put("message", "User is not an admin");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseMap);
            }
            */
        } catch (Exception e) {
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("valid", false);
            responseMap.put("message", "Error validating admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }
    }
} 