package com.example.server.controllers;

import com.example.server.dto.PostDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.services.PostService;
import com.example.server.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);
    private static final String COOKIE_NAME = "auth_token";

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${app.auth.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.auth.cookie.http-only:false}")
    private boolean cookieHttpOnly;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(
            @RequestPart(name = "post", required = false) String postJson,
            @RequestPart(name = "media", required = false) List<MultipartFile> mediaFiles,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Creating post with token: {}", token);

        try {
            if (token == null) {
                logger.warn("No auth token provided");
                return ResponseEntity.status(401).body("Unauthorized: No token provided");
            }

            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getStatusCode().isError()) {
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            if (user == null) {
                logger.warn("User not found for token");
                return ResponseEntity.status(401).body("Unauthorized: Invalid user");
            }

            PostDto postDto;
            try {
                if (postJson == null || postJson.trim().isEmpty()) {
                    postDto = new PostDto();
                    postDto.setContent(""); // Default content
                    postDto.setPrivacy("PUBLIC");
                    postDto.setMedia(new ArrayList<>()); // Khởi tạo media
                } else {
                    postDto = objectMapper.readValue(postJson, PostDto.class);
                }
            } catch (Exception e) {
                logger.error("Error parsing post JSON: {}", e.getMessage());
                return ResponseEntity.badRequest().body("Invalid post JSON format");
            }

            // Validate postDto
            if (postDto.getContent() == null) {
                postDto.setContent("");
            }
            if (postDto.getPrivacy() == null) {
                postDto.setPrivacy("PUBLIC");
            }
            if (postDto.getMedia() == null) {
                postDto.setMedia(new ArrayList<>());
            }

            PostDto createdPost = postService.createPost(postDto, mediaFiles, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(createdPost);
        } catch (UserException e) {
            logger.error("Error creating post: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating post: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Fetching post with id: {}", postId);

        try {
            Long userId = null;
            if (token != null) {
                ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
                if (validationResult.getBody() instanceof User reqUser) {
                    userId = reqUser.getId();
                }
            }

            PostDto post = postService.getPostById(postId, userId);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(post);
        } catch (UserException e) {
            logger.error("Error fetching post: {}", e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        logger.info("Fetching posts for page: {}, size: {}", page, size);

        Long userId = null;
        if (token != null) {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getBody() instanceof User reqUser) {
                userId = reqUser.getId();
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        PagedModel<?> posts = postService.getAllPosts(userId, pageable);
        setNoCacheHeaders(response);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostDto postDto,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Updating post with id: {}", postId);

        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getStatusCode().isError()) {
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            @SuppressWarnings("null")
            PostDto updatedPost = postService.updatePost(postId, postDto, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(updatedPost);
        } catch (UserException e) {
            logger.error("Error updating post: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @SuppressWarnings("null")
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Deleting post with id: {}", postId);

        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getStatusCode().isError()) {
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            postService.deletePost(postId, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            logger.error("Error deleting post: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{postId}/repost")
    public ResponseEntity<?> repostPost(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Reposting post with id: {}", postId);

        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getStatusCode().isError()) {
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            @SuppressWarnings("null")
            PostDto repostedPost = postService.repostPost(postId, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(repostedPost);
        } catch (UserException e) {
            logger.error("Error reposting post: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Liking post with id: {}", postId);

        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getStatusCode().isError()) {
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            @SuppressWarnings("null")
            PostDto likedPost = postService.likePost(postId, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(likedPost);
        } catch (UserException e) {
            logger.error("Error liking post: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<?> unlikePost(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Unliking post with id: {}", postId);

        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getStatusCode().isError()) {
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            @SuppressWarnings("null")
            PostDto unlikedPost = postService.unlikePost(postId, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(unlikedPost);
        } catch (UserException e) {
            logger.error("Error unliking post: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private ResponseEntity<?> validateTokenAndUser(String token, HttpServletResponse response) {
        if (token == null) {
            logger.warn("No auth token provided");
            return ResponseEntity.status(401).body("Unauthorized: No token provided");
        }

        try {
            User user = userService.findUserProfileByJwt(token);
            return ResponseEntity.ok(user);
        } catch (UserException e) {
            logger.error("Token validation failed: {}", e.getMessage());
            Cookie cookie = new Cookie(COOKIE_NAME, null);
            cookie.setMaxAge(0);
            cookie.setSecure(cookieSecure);
            cookie.setHttpOnly(cookieHttpOnly);
            cookie.setPath("/");
            response.addCookie(cookie);
            return ResponseEntity.status(401).body("Unauthorized: Invalid token");
        }
    }

    private void setNoCacheHeaders(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
    }
}