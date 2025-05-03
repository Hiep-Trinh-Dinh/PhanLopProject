package com.example.server.controllers;

import com.example.server.dto.PostDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.models.Post;
import com.example.server.services.PostService;
import com.example.server.services.UserService;
import com.example.server.services.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

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
    private NotificationService notificationService;

    @Value("${app.auth.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.auth.cookie.http-only:false}")
    private boolean cookieHttpOnly;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDto> createPost(
            @RequestPart("post") String postDtoJson,
            HttpServletRequest request) {
        
        logger.info("POST /api/posts/ - Create post request received");
        logger.info("Content type: {}", request.getContentType());
        
        // Log thông tin header và kích thước request
        logger.info("Request content length: {}", request.getContentLengthLong());
        
        // Log thông tin về multipart/form-data
        if (request.getContentType() != null && request.getContentType().startsWith("multipart/form-data")) {
            logger.info("Multipart boundary: {}", request.getContentType().split("boundary=")[1]);
        }
        
        // Xử lý form data đặc biệt cho media files
        List<MultipartFile> mediaFiles = new ArrayList<>();
        try {
            if (request instanceof MultipartHttpServletRequest) {
                MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
                // Thu thập tất cả các parts có tên bắt đầu bằng "media["
                for (String paramName : multipartRequest.getFileMap().keySet()) {
                    if (paramName.startsWith("media[")) {
                        MultipartFile file = multipartRequest.getFile(paramName);
                        if (file != null && !file.isEmpty()) {
                            logger.info("Found media file in param {}: name={}, size={}, content-type={}", 
                                paramName, file.getOriginalFilename(), file.getSize(), file.getContentType());
                            mediaFiles.add(file);
                        }
                    }
                }
            }
            
            // Log thông tin về mediaFiles
            logger.info("Collected {} media files", mediaFiles.size());
            for (int i = 0; i < mediaFiles.size(); i++) {
                MultipartFile file = mediaFiles.get(i);
                if (file != null) {
                    logger.info("Media[{}]: name={}, size={}, content-type={}, empty={}", 
                        i, file.getOriginalFilename(), file.getSize(), file.getContentType(), file.isEmpty());
                } else {
                    logger.info("Media[{}] is null", i);
                }
            }
        } catch (Exception e) {
            logger.error("Error collecting media files: {}", e.getMessage(), e);
        }
        
        try {
            // Log postDtoJson raw
            logger.info("PostDto JSON: {}", postDtoJson);
            
            ObjectMapper objectMapper = new ObjectMapper();
            PostDto postDto = objectMapper.readValue(postDtoJson, PostDto.class);
            
            // Log parsed postDto
            logger.info("Parsed PostDto: content length={}, privacy={}, media count={}", 
                postDto.getContent() != null ? postDto.getContent().length() : 0,
                postDto.getPrivacy(),
                postDto.getMedia() != null ? postDto.getMedia().size() : 0);
                
            if (postDto.getMedia() != null) {
                for (int i = 0; i < postDto.getMedia().size(); i++) {
                    PostDto.MediaDto mediaDto = postDto.getMedia().get(i);
                    logger.info("PostDto.Media[{}]: type={}, url={}", 
                        i, mediaDto.getMediaType(), 
                        mediaDto.getUrl() != null ? (mediaDto.getUrl().substring(0, Math.min(30, mediaDto.getUrl().length())) + "...") : "null");
                }
            }
            
            // Lấy thông tin user từ token trong request
            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), null);
            if (validationResult.getStatusCode().isError()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            User user = (User) validationResult.getBody();
            logger.info("Creating post for user: {}", user.getEmail());
            
            try {
                PostDto createdPost = postService.createPost(postDto, mediaFiles, user.getId());
                logger.info("Post created successfully: id={}", createdPost.getId());
                
                // Nếu bài viết được đặt là public hoặc friends - tạo thông báo cho bạn bè
                if ("PUBLIC".equalsIgnoreCase(postDto.getPrivacy()) || "FRIENDS".equalsIgnoreCase(postDto.getPrivacy())) {
                    try {
                        // Lấy danh sách bạn bè của người dùng
                        List<User> friends = new ArrayList<>(user.getFriends());
                        
                        if (!friends.isEmpty()) {
                            logger.info("Creating notifications for {} friends about new post {}", friends.size(), createdPost.getId());
                            
                            // Lấy đối tượng Post để tạo thông báo
                            notificationService.createNewPostNotification(
                                postService.getPostEntityById(createdPost.getId()), 
                                friends
                            );
                        }
                    } catch (Exception e) {
                        // Xử lý lỗi nhưng không làm ảnh hưởng tới việc tạo bài viết
                        logger.error("Error creating notifications for new post: {}", e.getMessage(), e);
                    }
                }
                
                return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
            } catch (Exception e) {
                logger.error("Error creating post: {}", e.getMessage(), e);
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            logger.error("Error parsing PostDto JSON: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
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

    @PutMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updatePost(
            @PathVariable Long postId,
            @RequestPart("post") String postDtoJson,
            HttpServletRequest request,
            HttpServletResponse response) {
        logger.info("PUT /api/posts/{} - Nhận yêu cầu cập nhật bài viết", postId);
        List<MultipartFile> mediaFiles = new ArrayList<>();
        try {
            if (request instanceof MultipartHttpServletRequest) {
                MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
                for (String paramName : multipartRequest.getFileMap().keySet()) {
                    if (paramName.startsWith("media[")) {
                        MultipartFile file = multipartRequest.getFile(paramName);
                        if (file != null && !file.isEmpty()) {
                            logger.info("Tìm thấy tệp media: name={}, size={}, content-type={}", 
                                        file.getOriginalFilename(), file.getSize(), file.getContentType());
                            mediaFiles.add(file);
                        }
                    }
                }
            }
            logger.info("Thu thập {} tệp media", mediaFiles.size());

            ObjectMapper objectMapper = new ObjectMapper();
            PostDto postDto = objectMapper.readValue(postDtoJson, PostDto.class);
            logger.info("Parsed PostDto: content length={}, privacy={}", 
                        postDto.getContent() != null ? postDto.getContent().length() : 0, postDto.getPrivacy());

            ResponseEntity<?> validationResult = validateTokenAndUser(getTokenFromRequest(request), response);
            if (validationResult.getStatusCode().isError()) {
                setNoCacheHeaders(response);
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            if (user != null) {
                logger.info("Cập nhật bài viết cho người dùng: {}", user.getEmail());
            } else {
                logger.warn("User is null while attempting to update post");
            }

            // Gọi updatePost với mediaFiles
            if (user == null) {
                logger.warn("User is null while attempting to update post");
                setNoCacheHeaders(response);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: User not found");
            }
            PostDto updatedPost = postService.updatePost(postId, postDto, mediaFiles, user.getId());
            logger.info("Bài viết được cập nhật thành công: id={}", updatedPost.getId());

            setNoCacheHeaders(response);
            return ResponseEntity.ok(updatedPost);
        } catch (UserException e) {
            logger.error("Lỗi khi cập nhật bài viết: {}", e.getMessage());
            setNoCacheHeaders(response);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không mong muốn khi cập nhật bài viết: {}", e.getMessage(), e);
            setNoCacheHeaders(response);
            return ResponseEntity.status(500).body("Lỗi server nội bộ");
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
            
            // Lấy post entity để tạo thông báo
            Post post = postService.getPostEntityById(postId);
            
            // Tạo thông báo cho chủ bài viết nếu người chia sẻ không phải là chủ bài viết
            if (post != null && !post.getUser().getId().equals(user.getId())) {
                notificationService.createPostShareNotification(post, user);
            }
            
            setNoCacheHeaders(response);
            return ResponseEntity.ok(repostedPost);
        } catch (UserException e) {
            logger.error("Error reposting post: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{postId}/repost")
    public ResponseEntity<?> unrepostPost(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Unreposting post with id: {}", postId);

        try {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getStatusCode().isError()) {
                return validationResult;
            }

            User user = (User) validationResult.getBody();
            @SuppressWarnings("null")
            PostDto unrepostedPost = postService.unrepostPost(postId, user.getId());
            setNoCacheHeaders(response);
            return ResponseEntity.ok(unrepostedPost);
        } catch (UserException e) {
            logger.error("Error unreposting post: {}", e.getMessage());
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Fetching posts for user ID: {}, page: {}, size: {}", userId, page, size);

        Long currentUserId = null;
        if (token != null) {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getBody() instanceof User reqUser) {
                currentUserId = reqUser.getId();
            }
        }

        try {
            // First, verify that the user exists
            userService.findUserById(userId);
            
            Pageable pageable = PageRequest.of(page, size);
            PagedModel<?> posts = postService.getPostsByUserId(userId, currentUserId, pageable);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(posts);
        } catch (UserException e) {
            logger.error("Error fetching posts for user: {}", e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error fetching posts for user: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @GetMapping("/user/{userId}/shared")
    public ResponseEntity<?> getSharedPostsByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Fetching shared posts for user ID: {}, page: {}, size: {}", userId, page, size);

        Long currentUserId = null;
        if (token != null) {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getBody() instanceof User reqUser) {
                currentUserId = reqUser.getId();
            }
        }

        try {
            // First, verify that the user exists
            userService.findUserById(userId);
            
            Pageable pageable = PageRequest.of(page, size);
            PagedModel<?> posts = postService.getSharedPostsByUserId(userId, currentUserId, pageable);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(posts);
        } catch (UserException e) {
            logger.error("Error fetching shared posts for user: {}", e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error fetching shared posts for user: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Searching posts with query: '{}', page: {}, size: {}", query, page, size);

        Long userId = null;
        if (token != null) {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getBody() instanceof User reqUser) {
                userId = reqUser.getId();
            }
        }

        try {
            Pageable pageable = PageRequest.of(page, size);
            PagedModel<?> posts = postService.searchPosts(query, userId, pageable);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error searching posts: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupPosts(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Fetching posts for group ID: {}, page: {}, size: {}", groupId, page, size);

        Long userId = null;
        if (token != null) {
            ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
            if (validationResult.getBody() instanceof User reqUser) {
                userId = reqUser.getId();
            }
        }

        try {
            Pageable pageable = PageRequest.of(page, size);
            PagedModel<?> posts = postService.getGroupPosts(groupId, userId, pageable);
            setNoCacheHeaders(response);
            return ResponseEntity.ok(posts);
        } catch (UserException e) {
            logger.error("Error fetching group posts: {}", e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error fetching group posts: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error");
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

    // Phương thức để lấy token từ request
    private String getTokenFromRequest(HttpServletRequest request) {
        // Ưu tiên lấy từ cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        // Nếu không có trong cookie, thử lấy từ header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        return null;
    }
}