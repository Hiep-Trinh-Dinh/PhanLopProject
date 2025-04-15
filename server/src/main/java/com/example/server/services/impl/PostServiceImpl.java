package com.example.server.services.impl;

import com.example.server.dto.PostDto;
import com.example.server.exception.UserException;
import com.example.server.mapper.PostDtoMapper;
import com.example.server.models.Post;
import com.example.server.models.PostMedia;
import com.example.server.models.User;
import com.example.server.repositories.PostMediaRepository;
import com.example.server.repositories.PostRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.LikeService;
import com.example.server.services.PostService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PostServiceImpl implements PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostServiceImpl.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostMediaRepository postMediaRepository;

    @Autowired
    private LikeService likeService;



    @PersistenceContext
    private EntityManager entityManager;

    @Value("${app.video.storage.path:/Videos/Web}")
    private String videoStoragePath;

    @SuppressWarnings("null")
    @Override
    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public PostDto createPost(PostDto postDto, List<MultipartFile> mediaFiles, Long userId) throws UserException {
        logger.info("Creating post for userId: {}", userId);

        // Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id: " + userId));
        logger.debug("Found user: id={}, username={}", user.getId(), user.getEmail());

        // Validate postDto
        if (postDto.getContent() == null || postDto.getContent().trim().isEmpty()) {
            postDto.setContent(""); // Default content
        }

        Post.Privacy privacy;
        try {
            privacy = postDto.getPrivacy() != null ? Post.Privacy.valueOf(postDto.getPrivacy()) : Post.Privacy.PUBLIC;
        } catch (IllegalArgumentException e) {
            throw new UserException("Invalid privacy value: " + postDto.getPrivacy());
        }

        // Tạo và lưu Post
        Post post = new Post();
        post.setContent(postDto.getContent());
        post.setUser(user);
        post.setPrivacy(privacy);
        post.setMedia(new ArrayList<>());
        logger.debug("Saving post without media: content={}", post.getContent());
        Post savedPost = postRepository.save(post);
        logger.debug("Saved post with id: {}", savedPost.getId());

        // Xử lý ảnh từ PostDto.media (Cloudinary URLs)
        if (postDto.getMedia() != null && !postDto.getMedia().isEmpty()) {
            logger.debug("Processing {} image media items", postDto.getMedia().size());
            for (PostDto.MediaDto mediaDto : postDto.getMedia()) {
                if (mediaDto.getMediaType() == null || mediaDto.getUrl() == null || mediaDto.getUrl().isEmpty()) {
                    logger.warn("Invalid image media: type or URL missing");
                    continue;
                }
                if (!mediaDto.getMediaType().equals("IMAGE")) {
                    logger.warn("Only IMAGE media is allowed in PostDto, found: {}", mediaDto.getMediaType());
                    continue;
                }
                if (!mediaDto.getUrl().startsWith("https://res.cloudinary.com/")) {
                    logger.warn("Invalid Cloudinary URL: {}", mediaDto.getUrl());
                    continue;
                }
                PostMedia media = new PostMedia();
                media.setPost(savedPost);
                media.setMediaType(PostMedia.MediaType.IMAGE);
                media.setMediaUrl(mediaDto.getUrl());
                media.setMediaOrder(savedPost.getMedia().size());
                postMediaRepository.save(media);
                savedPost.getMedia().add(media);
                logger.debug("Added image media: url={}", mediaDto.getUrl());
            }
        }

        // Xử lý video từ mediaFiles
        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            logger.debug("Processing {} video files", mediaFiles.size());
            try {
                Files.createDirectories(Paths.get(videoStoragePath));
                for (MultipartFile file : mediaFiles) {
                    if (file == null || file.isEmpty() || file.getContentType() == null) {
                        logger.warn("Invalid video file: null or empty");
                        continue;
                    }
                    if (!file.getContentType().startsWith("video/")) {
                        logger.warn("File is not a video: {}", file.getContentType());
                        continue;
                    }
                    if (file.getSize() > 100 * 1024 * 1024) { // 100MB
                        logger.warn("Video too large: {} bytes", file.getSize());
                        throw new UserException("Video quá lớn, tối đa 100MB");
                    }
                    if (!file.getContentType().matches("video/(mp4|webm|ogg)")) {
                        logger.warn("Unsupported video format: {}", file.getContentType());
                        throw new UserException("Chỉ hỗ trợ video MP4, WebM, OGG");
                    }
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path filePath = Paths.get(videoStoragePath, fileName);
                    Files.write(filePath, file.getBytes());

                    PostMedia media = new PostMedia();
                    media.setPost(savedPost);
                    media.setMediaType(PostMedia.MediaType.VIDEO);
                    media.setMediaUrl("/videos/" + fileName);
                    media.setMediaOrder(savedPost.getMedia().size());
                    postMediaRepository.save(media);
                    savedPost.getMedia().add(media);
                    logger.debug("Added video media: url=/videos/{}", fileName);
                }
            } catch (IOException e) {
                logger.error("Error saving video: {}", e.getMessage());
                throw new UserException("Error saving video: " + e.getMessage());
            }
        }

        logger.info("Post created successfully with id: {}", savedPost.getId());
        return PostDtoMapper.toPostDto(savedPost, user);
    }

    @Override
    @Cacheable(value = "posts", key = "#postId + ':' + #userId")
    public PostDto getPostById(Long postId, Long userId) throws UserException {
        logger.info("Fetching post {} with userId: {}", postId, userId);
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new UserException("Post not found"));
        if (!post.getPrivacy().equals(Post.Privacy.PUBLIC) && (userId == null || !userId.equals(post.getUser().getId()))) {
            logger.warn("Access denied for post {} with userId: {}", postId, userId);
            throw new UserException("No permission to view this post");
        }
        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
        PostDto dto = PostDtoMapper.toPostDtoWithDetails(post, reqUser);
        logger.debug("Returning post DTO: {}", dto);
        return dto;
    }

    @Override
    public PagedModel<?> getAllPosts(Long userId, Pageable pageable) {
        logger.info("Fetching posts with userId: {}, page: {}, size: {}", userId, pageable.getPageNumber(), pageable.getPageSize());
        Page<Post> posts;
        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
        if (userId != null) {
            posts = postRepository.findByPrivacyOrUserId(Post.Privacy.PUBLIC, userId, pageable);
        } else {
            posts = postRepository.findByPrivacy(Post.Privacy.PUBLIC, pageable);
        }
        
        List<PostDto> postDtos = PostDtoMapper.toPostDtos(posts.getContent(), reqUser);
        
        PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
            posts.getSize(),
            posts.getNumber(),
            posts.getTotalElements(),
            posts.getTotalPages()
        );
        
        PagedModel<?> pagedModel = PagedModel.of(postDtos, metadata);
        
        Link selfLink = Link.of(String.format("/api/posts?page=%d&size=%d", posts.getNumber(), posts.getSize())).withSelfRel();
        pagedModel.add(selfLink);
        
        if (posts.hasNext()) {
            Link nextLink = Link.of(String.format("/api/posts?page=%d&size=%d", posts.getNumber() + 1, posts.getSize())).withRel("next");
            pagedModel.add(nextLink);
        }
        
        if (posts.hasPrevious()) {
            Link prevLink = Link.of(String.format("/api/posts?page=%d&size=%d", posts.getNumber() - 1, posts.getSize())).withRel("prev");
            pagedModel.add(prevLink);
        }
        
        logger.debug("Returning paged model with {} posts", postDtos.size());
        return pagedModel;
    }

    @Override
    @Transactional
    @CacheEvict(value = "posts", key = "#postId")
    public PostDto updatePost(Long postId, PostDto postDto, Long userId) throws UserException {
        logger.info("Updating post with id: {} for userId: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        if (!post.getUser().getId().equals(userId)) {
            throw new UserException("You are not authorized to update this post");
        }

        if (postDto.getContent() != null && !postDto.getContent().trim().isEmpty()) {
            post.setContent(postDto.getContent());
        }

        if (postDto.getPrivacy() != null) {
            try {
                post.setPrivacy(Post.Privacy.valueOf(postDto.getPrivacy()));
            } catch (IllegalArgumentException e) {
                throw new UserException("Invalid privacy value: " + postDto.getPrivacy());
            }
        }

        Post updatedPost = postRepository.save(post);
        return PostDtoMapper.toPostDto(updatedPost, post.getUser());
    }

    @Override
    @Transactional
    @CacheEvict(value = "posts", key = "#postId")
    public void deletePost(Long postId, Long userId) throws UserException {
        logger.info("Deleting post with id: {} for userId: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        if (!post.getUser().getId().equals(userId)) {
            throw new UserException("You are not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    @Override
    @Transactional
    @CacheEvict(value = "posts", key = "#postId")
    public PostDto repostPost(Long postId, Long userId) throws UserException {
        logger.info("Reposting post with id: {} for userId: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id: " + userId));

        if (!post.getRepostUsers().contains(user)) {
            post.getRepostUsers().add(user);
            postRepository.save(post);
        }

        return PostDtoMapper.toPostDto(post, user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "posts", key = "#postId")
    public PostDto likePost(Long postId, Long userId) throws UserException {
        logger.info("Liking post with id: {} for userId: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id: " + userId));

        likeService.likePost(postId, userId);
        return PostDtoMapper.toPostDto(post, user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "posts", key = "#postId")
    public PostDto unlikePost(Long postId, Long userId) throws UserException {
        logger.info("Unliking post with id: {} for userId: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id: " + userId));

        likeService.unlikePost(postId, userId);
        return PostDtoMapper.toPostDto(post, user);
    }

    @SuppressWarnings("unused")
    private boolean canViewPost(Post post, User reqUser) {
        logger.debug("Checking access for userId: {} to postId: {} (privacy: {})", 
                reqUser.getId(), post.getId(), post.getPrivacy());
        switch (post.getPrivacy()) {
            case PUBLIC:
                return true;
            case FRIENDS:
                boolean isFriend = post.getUser().getFriends().contains(reqUser);
                logger.debug("Is friend: {}", isFriend);
                return isFriend;
            case ONLY_ME:
                boolean isOwner = post.getUser().getId().equals(reqUser.getId());
                logger.debug("Is owner: {}", isOwner);
                return isOwner;
            default:
                logger.warn("Unknown privacy setting: {}", post.getPrivacy());
                return false;
        }
    }
}