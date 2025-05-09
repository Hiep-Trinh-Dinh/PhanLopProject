package com.example.server.controllers;

import java.util.HashMap;
import java.util.Map;

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

import com.example.server.dto.AdminPostDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.services.AdminPostService;
import com.example.server.services.UserService;

@RestController
@RequestMapping("/api/admin/posts")
public class AdminPostController {

    private static final Logger logger = LoggerFactory.getLogger(AdminPostController.class);

    @Autowired
    private AdminPostService adminPostService;

    @Autowired
    private UserService userService;

    private User validateAdminUser() throws UserException {
        logger.info("Bắt đầu xác thực admin user từ SecurityContext");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Authentication object: {}", authentication);

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            logger.warn("Không tìm thấy người dùng đã xác thực");
            throw new UserException("Không tìm thấy token hợp lệ", HttpStatus.UNAUTHORIZED);
        }

        String email = authentication.getName();
        logger.info("Lấy được email từ Authentication: {}", email);
        User user = userService.findByEmail(email);

        if (user == null) {
            logger.error("Không tìm thấy người dùng với email: {}", email);
            throw new UserException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND);
        }

        if (!user.getIsActive()) {
            logger.warn("Tài khoản đã bị khóa: {}", email);
            throw new UserException("Tài khoản đã bị khóa", HttpStatus.FORBIDDEN);
        }

        if (!user.isAdmin()) {
            logger.warn("Người dùng không có quyền admin: {}", email);
            throw new UserException("Không có quyền truy cập trang quản trị", HttpStatus.FORBIDDEN);
        }

        logger.info("Xác thực admin thành công cho user: {}", email);
        return user;
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "all") String status) {

        try {
            validateAdminUser();

            Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<AdminPostDto> posts = adminPostService.getAllPosts(pageable, query, status);

            Map<String, Object> response = new HashMap<>();
            response.put("posts", posts.getContent());
            response.put("currentPage", posts.getNumber());
            response.put("totalItems", posts.getTotalElements());
            response.put("totalPages", posts.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (UserException e) {
            logger.warn("Lỗi xác thực: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus())
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách bài viết: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable Long postId) {
        try {
            validateAdminUser();

            AdminPostDto post = adminPostService.getPostById(postId);
            return ResponseEntity.ok(post);
        } catch (UserException e) {
            logger.warn("Lỗi xác thực: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus())
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy bài viết ID {}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long postId,
            @RequestBody AdminPostDto postDto) {

        try {
            validateAdminUser();

            AdminPostDto updatedPost = adminPostService.updatePost(postId, postDto);
            return ResponseEntity.ok(updatedPost);
        } catch (UserException e) {
            logger.warn("Lỗi xác thực: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus())
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi cập nhật bài viết ID {}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    @PutMapping("/{postId}/lock")
    public ResponseEntity<?> lockPost(@PathVariable Long postId) {
        try {
            validateAdminUser();

            AdminPostDto post = adminPostService.lockPost(postId);
            return ResponseEntity.ok(Map.of("message", "Post locked successfully", "post", post));
        } catch (UserException e) {
            logger.warn("Lỗi xác thực: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus())
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi khóa bài viết ID {}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    @PutMapping("/{postId}/unlock")
    public ResponseEntity<?> unlockPost(@PathVariable Long postId) {
        try {
            validateAdminUser();

            AdminPostDto post = adminPostService.unlockPost(postId);
            return ResponseEntity.ok(Map.of("message", "Post unlocked successfully", "post", post));
        } catch (UserException e) {
            logger.warn("Lỗi xác thực: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus())
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi mở khóa bài viết ID {}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testAdminPostAccess() {
        return ResponseEntity.ok("Admin post API is accessible");
    }
}