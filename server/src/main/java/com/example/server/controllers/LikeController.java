package com.example.server.controllers;

import com.example.server.config.JwtProvider;
import com.example.server.dto.PostDto;
import com.example.server.dto.CommentDto;
import com.example.server.dto.LikeDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.services.LikeService;
import com.example.server.services.PostService;
import com.example.server.services.CommentService;
import com.example.server.services.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private static final Logger logger = LoggerFactory.getLogger(LikeController.class);

    @Autowired
    private LikeService likeService;

    @Autowired
    private PostService postService;

    @Autowired
    private CommentService commentService;

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
    public ResponseEntity<?> likePost(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Liking post with id: {}", postId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            // Kiểm tra quyền xem bài viết
            postService.getPostById(postId, reqUser.getId());
            likeService.likePost(postId, reqUser.getId());
            PostDto postDto = postService.getPostById(postId, reqUser.getId());
            if (postDto == null) {
                logger.error("Post not found after liking: {}", postId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bài viết không tồn tại");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(postDto);
        } catch (UserException e) {
            logger.error("Error liking post {}: {}", postId, e.getMessage());
            if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền xem bài viết");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi thích bài viết: " + e.getMessage());
        }
    }

    @PostMapping("/comment/{commentId}")
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
            CommentDto commentDto = commentService.likeComment(commentId, reqUser.getId());
            if (commentDto == null) {
                logger.error("Comment not found after liking: {}", commentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bình luận không tồn tại");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(commentDto);
        } catch (UserException e) {
            logger.error("Error liking comment {}: {}", commentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi thích bình luận: " + e.getMessage());
        }
    }

    @DeleteMapping("/post/{postId}")
    public ResponseEntity<?> unlikePost(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Unliking post with id: {}", postId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            // Kiểm tra quyền xem bài viết
            postService.getPostById(postId, reqUser.getId());
            likeService.unlikePost(postId, reqUser.getId());
            PostDto postDto = postService.getPostById(postId, reqUser.getId());
            if (postDto == null) {
                logger.error("Post not found after unliking: {}", postId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bài viết không tồn tại");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(postDto);
        } catch (UserException e) {
            logger.error("Error unliking post {}: {}", postId, e.getMessage());
            if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền xem bài viết");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi bỏ thích bài viết: " + e.getMessage());
        }
    }

    @DeleteMapping("/comment/{commentId}")
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
            CommentDto commentDto = commentService.unlikeComment(commentId, reqUser.getId());
            if (commentDto == null) {
                logger.error("Comment not found after unliking: {}", commentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bình luận không tồn tại");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(commentDto);
        } catch (UserException e) {
            logger.error("Error unliking comment {}: {}", commentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Lỗi khi bỏ thích bình luận: " + e.getMessage());
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getLikesByPostId(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Fetching likes for post with id: {}", postId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            // Kiểm tra quyền xem bài viết
            postService.getPostById(postId, reqUser.getId());
            List<LikeDto> likes = likeService.getLikesByPostId(postId, reqUser.getId());
            if (likes == null) {
                logger.error("Failed to fetch likes for post: {}", postId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không thể lấy danh sách lượt thích");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(likes);
        } catch (UserException e) {
            logger.error("Error fetching likes for post {}: {}", postId, e.getMessage());
            if (e.getMessage().contains("permission")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền xem bài viết");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bài viết không tồn tại");
        }
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<?> getLikesByCommentId(
            @PathVariable Long commentId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Fetching likes for comment with id: {}", commentId);
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            List<LikeDto> likes = likeService.getLikesByCommentId(commentId, reqUser.getId());
            if (likes == null) {
                logger.error("Failed to fetch likes for comment: {}", commentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không thể lấy danh sách lượt thích");
            }
            setNoCacheHeaders(response);
            return ResponseEntity.ok(likes);
        } catch (UserException e) {
            logger.error("Error fetching likes for comment {}: {}", commentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bình luận không tồn tại");
        }
    }
}