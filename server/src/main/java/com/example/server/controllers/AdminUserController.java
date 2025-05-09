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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.server.dto.AdminUserDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.services.AdminUserService;
import com.example.server.services.UserService;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private AdminUserService adminUserService;

    private User validateAdminUser() throws UserException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Validating admin user from SecurityContext: {}", authentication);

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            logger.warn("No authenticated user found");
            throw new UserException("Access Denied - No authenticated user", HttpStatus.FORBIDDEN);
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            logger.warn("Không tìm thấy người dùng với email: {}", email);
            throw new UserException("Access Denied - Người dùng không tồn tại", HttpStatus.FORBIDDEN);
        }

        if (!user.isAdmin()) {
            logger.warn("Người dùng không có quyền admin: {}", email);
            throw new UserException("Access Denied - Bạn không có quyền admin", HttpStatus.FORBIDDEN);
        }

        logger.debug("Xác thực admin thành công cho user: {}", email);
        return user;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "all") String status) {

        try {
            validateAdminUser();

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

        } catch (UserException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(errorResponse);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách người dùng: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi server: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserDetail(@PathVariable Long userId) {
        try {
            validateAdminUser();

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
    public ResponseEntity<?> createUser(@RequestBody AdminUserDto userDto) {
        try {
            validateAdminUser();

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
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody AdminUserDto userDto) {
        try {
            validateAdminUser();

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
    public ResponseEntity<?> lockUser(@PathVariable Long userId) {
        try {
            validateAdminUser();

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
    public ResponseEntity<?> unlockUser(@PathVariable Long userId) {
        try {
            validateAdminUser();

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

    @GetMapping("/test")
    public ResponseEntity<?> testAdminEndpoint() {
        logger.info("Gọi đến API test");

        Map<String, Object> response_data = new HashMap<>();
        response_data.put("message", "API test hoạt động");
        response_data.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(response_data);
    }

    @GetMapping("/isAdminValid")
    public ResponseEntity<Map<String, Boolean>> isAdminValid() {
        try {
            validateAdminUser();

            Map<String, Boolean> response = new HashMap<>();
            response.put("valid", true);
            return ResponseEntity.ok(response);

        } catch (UserException e) {
            logger.warn("Validation failed: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(Map.of("valid", false));
        } catch (Exception e) {
            logger.error("Lỗi khi kiểm tra quyền admin: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("valid", false));
        }
    }
}