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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.dto.AdminPostDto;
import com.example.server.models.Post;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.config.JwtProvider;
import com.example.server.services.AdminPostService;
import com.example.server.services.AdminUserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/posts")
@Slf4j
public class AdminPostController {

    private static final Logger logger = LoggerFactory.getLogger(AdminPostController.class);

    @Autowired
    private AdminPostService adminPostService;

    @Autowired
    private AdminUserService adminUserService;
    
    @Autowired
    private JwtProvider jwtProvider;
    
    // Kiểm tra token và quyền admin
    private User validateAdminUser(HttpServletRequest request) throws UserException {
        String jwt = jwtProvider.getJwtFromRequest(request);
        
        if (jwt == null) {
            throw new UserException("Không tìm thấy token hợp lệ", HttpStatus.UNAUTHORIZED);
        }
        
        Long userId = jwtProvider.getUserIdFromToken(jwt);
        User user = adminUserService.findUserById(userId);
        
        if (!user.getIsActive()) {
            throw new UserException("Tài khoản đã bị khóa", HttpStatus.FORBIDDEN);
        }
        
        if (!user.getEmail().endsWith("@admin.com")) {
            throw new UserException("Không có quyền truy cập trang quản trị", HttpStatus.FORBIDDEN);
        }
        
        return user;
    }
    
    /**
     * Get all posts with pagination, sorting, and filtering
     */
    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "all") String status,
            HttpServletRequest request) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<AdminPostDto> posts = adminPostService.getAllPosts(pageable, query, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("posts", posts.getContent());
            response.put("currentPage", posts.getNumber());
            response.put("totalItems", posts.getTotalElements());
            response.put("totalPages", posts.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting posts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting posts: " + e.getMessage());
        }
    }
    
    /**
     * Get a post by ID
     */
    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable Long postId) {
        try {
            AdminPostDto post = adminPostService.getPostById(postId);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            logger.error("Error getting post with ID: {}", postId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting post: " + e.getMessage());
        }
    }
    
    /**
     * Update a post
     */
    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long postId,
            @RequestBody AdminPostDto postDto) {
        
        try {
            AdminPostDto updatedPost = adminPostService.updatePost(postId, postDto);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            logger.error("Error updating post with ID: {}", postId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating post: " + e.getMessage());
        }
    }
    
    /**
     * Lock a post
     */
    @PutMapping("/{postId}/lock")
    public ResponseEntity<?> lockPost(@PathVariable Long postId) {
        try {
            AdminPostDto post = adminPostService.lockPost(postId);
            return ResponseEntity.ok(Map.of("message", "Post locked successfully", "post", post));
        } catch (Exception e) {
            logger.error("Error locking post with ID: {}", postId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error locking post: " + e.getMessage());
        }
    }
    
    /**
     * Unlock a post
     */
    @PutMapping("/{postId}/unlock")
    public ResponseEntity<?> unlockPost(@PathVariable Long postId) {
        try {
            AdminPostDto post = adminPostService.unlockPost(postId);
            return ResponseEntity.ok(Map.of("message", "Post unlocked successfully", "post", post));
        } catch (Exception e) {
            logger.error("Error unlocking post with ID: {}", postId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error unlocking post: " + e.getMessage());
        }
    }
    
    /**
     * Test endpoint for checking admin access
     */
    @GetMapping("/test")
    public ResponseEntity<?> testAdminPostAccess() {
        return ResponseEntity.ok("Admin post API is accessible");
    }
} 