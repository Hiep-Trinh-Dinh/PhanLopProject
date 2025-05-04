package com.example.server.controllers;

import com.example.server.config.JwtProvider;
import com.example.server.dto.CommentDto;
import com.example.server.exception.UserException;
import com.example.server.models.Comment;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.services.CommentService;
import com.example.server.services.NotificationService;
import com.example.server.services.PostService;
import com.example.server.services.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);

    @Autowired
    private CommentService commentService;

    @Autowired
    private PostService postService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Value("${app.secure:true}")
    private boolean secureCookie;

    private static final String COOKIE_NAME = "auth_token";
    private static final String BLACKLIST_PREFIX = "blacklist_token:";

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private ResponseEntity<?> validateTokenAndUser(String token, HttpServletResponse response) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            logger.warn("Invalid or missing token");
            clearJwtCookie(response);
            setNoCacheHeaders(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token không hợp lệ");
        }

        if (isTokenBlacklisted(token)) {
            logger.warn("Token is blacklisted");
            clearJwtCookie(response);
            setNoCacheHeaders(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token đã bị vô hiệu hóa");
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            logger.warn("User not found for token");
            clearJwtCookie(response);
            setNoCacheHeaders(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Người dùng không tồn tại");
        }

        return ResponseEntity.ok(reqUser);
    }

    private boolean isTokenBlacklisted(String token) {
        String blacklisted = redisTemplate.opsForValue().get(BLACKLIST_PREFIX + token);
        return blacklisted != null;
    }

    private void setNoCacheHeaders(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<?> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentDto commentDto,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Creating comment for post id: {}", postId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            // Kiểm tra quyền xem bài đăng trước khi comment
            postService.getPostById(postId, reqUser.getId());
            CommentDto createdComment = commentService.createComment(commentDto, postId, reqUser.getId());
            
            if (createdComment == null) {
                logger.error("Failed to create comment for post: {}", postId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể tạo bình luận");
            }

            // Lấy post và comment entity để tạo thông báo
            Post post = postService.getPostEntityById(postId);
            Comment comment = commentService.getCommentEntityById(createdComment.getId());
            
            // Tạo thông báo cho chủ bài viết nếu người bình luận không phải là chủ bài viết
            if (post != null && comment != null && !post.getUser().getId().equals(reqUser.getId())) {
                notificationService.createPostCommentNotification(post, comment, reqUser);
            }
            setNoCacheHeaders(response);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        } catch (UserException e) {
            logger.error("Error creating comment for post {}: {}", postId, e.getMessage());
            if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền xem bài viết");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi tạo bình luận: " + e.getMessage());
        }
    }

    @PostMapping("/post/{postId}/reply/{parentCommentId}")
    public ResponseEntity<?> createReply(
            @PathVariable Long postId,
            @PathVariable Long parentCommentId,
            @Valid @RequestBody CommentDto commentDto,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Creating reply for comment id: {} in post id: {}", parentCommentId, postId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            // Kiểm tra quyền xem bài đăng
            postService.getPostById(postId, reqUser.getId());
            CommentDto createdReply = commentService.createReply(commentDto, postId, parentCommentId, reqUser.getId());
            if (createdReply == null) {
                logger.error("Failed to create reply for comment: {}", parentCommentId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể tạo trả lời");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReply);
        } catch (UserException e) {
            logger.error("Error creating reply for comment {}: {}", parentCommentId, e.getMessage());
            if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền xem bài viết");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi tạo trả lời: " + e.getMessage());
        }
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<?> getCommentById(
            @PathVariable Long commentId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Fetching comment with id: {}", commentId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            CommentDto commentDto = commentService.getCommentById(commentId, reqUser.getId());
            if (commentDto == null) {
                logger.error("Comment not found: {}", commentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bình luận không tồn tại");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(commentDto);
        } catch (UserException e) {
            logger.error("Error fetching comment {}: {}", commentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bình luận không tồn tại");
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getCommentsByPostId(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Fetching comments for post id: {}", postId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            // Kiểm tra quyền xem bài đăng
            postService.getPostById(postId, reqUser.getId());
            List<CommentDto> comments = commentService.getCommentsByPostId(postId, reqUser.getId());
            if (comments == null) {
                logger.error("Failed to fetch comments for post: {}", postId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không thể lấy danh sách bình luận");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(comments);
        } catch (UserException e) {
            logger.error("Error fetching comments for post {}: {}", postId, e.getMessage());
            if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền xem bài viết");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bài viết không tồn tại");
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentDto commentDto,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Updating comment with id: {}", commentId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            CommentDto updatedComment = commentService.updateComment(commentId, commentDto, reqUser.getId());
            if (updatedComment == null) {
                logger.error("Failed to update comment: {}", commentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bình luận không tồn tại");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(updatedComment);
        } catch (UserException e) {
            logger.error("Error updating comment {}: {}", commentId, e.getMessage());
            if (e.getMessage().contains("authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền chỉnh sửa bình luận");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi cập nhật bình luận: " + e.getMessage());
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Deleting comment with id: {}", commentId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            commentService.deleteComment(commentId, reqUser.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.noContent().build();
        } catch (UserException e) {
            logger.error("Error deleting comment {}: {}", commentId, e.getMessage());
            if (e.getMessage().contains("authorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền xóa bình luận");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bình luận không tồn tại");
        }
    }

    @PutMapping("/{commentId}/like")
    public ResponseEntity<?> likeComment(
            @PathVariable Long commentId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Liking comment with id: {}", commentId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            CommentDto likedComment = commentService.likeComment(commentId, reqUser.getId());
            if (likedComment == null) {
                logger.error("Comment not found after liking: {}", commentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bình luận không tồn tại");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(likedComment);
        } catch (UserException e) {
            logger.error("Error liking comment {}: {}", commentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi thích bình luận: " + e.getMessage());
        }
    }

    @PutMapping("/{commentId}/unlike")
    public ResponseEntity<?> unlikeComment(
            @PathVariable Long commentId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Unliking comment with id: {}", commentId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            CommentDto unlikedComment = commentService.unlikeComment(commentId, reqUser.getId());
            if (unlikedComment == null) {
                logger.error("Comment not found after unliking: {}", commentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bình luận không tồn tại");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(unlikedComment);
        } catch (UserException e) {
            logger.error("Error unliking comment {}: {}", commentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi bỏ thích bình luận: " + e.getMessage());
        }
    }
}