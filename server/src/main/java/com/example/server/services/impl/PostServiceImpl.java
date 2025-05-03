package com.example.server.services.impl;

import com.example.server.dto.PostDto;
import com.example.server.exception.UserException;
import com.example.server.mapper.PostDtoMapper;
import com.example.server.models.Group;
import com.example.server.models.GroupMember;
import com.example.server.models.Post;
import com.example.server.models.PostMedia;
import com.example.server.models.User;
import com.example.server.repositories.GroupMemberRepository;
import com.example.server.repositories.GroupRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @Autowired
    private PostDtoMapper postDtoMapper;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private GroupRepository groupRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${app.video.storage.path:/Videos/Web}")
    private String videoStoragePath;

    @Override
    public PostDto getPostById(Long postId, Long userId) throws UserException {
        logger.info("Đang lấy bài viết {} với userId: {}", postId, userId);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Không tìm thấy bài viết"));

        // Kiểm tra quyền truy cập nhóm nếu bài viết thuộc nhóm
        if (post.getGroup() != null && userId != null) {
            groupMemberRepository.findByGroupIdAndUserId(post.getGroup().getId(), userId)
                    .orElseThrow(() -> new UserException("Bạn không phải là thành viên của nhóm này"));
        } else if (post.getGroup() != null && userId == null && post.getGroup().getPrivacy() == Group.Privacy.PRIVATE) {
            throw new UserException("Không có quyền truy cập bài viết nhóm riêng tư");
        }

        if (!post.getPrivacy().equals(Post.Privacy.PUBLIC) && (userId == null || !userId.equals(post.getUser().getId()))) {
            logger.warn("Không có quyền xem bài viết {} với userId: {}", postId, userId);
            throw new UserException("Bạn không có quyền xem bài viết này");
        }

        if (Boolean.TRUE.equals(post.getIsActive())) {
            throw new UserException("Bài viết này đã bị ẩn");
        }

        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
        return postDtoMapper.toPostDtoWithDetails(post, reqUser);
    }

    @Override
    public PagedModel<?> getAllPosts(Long userId, Pageable pageable) {
        logger.info("Đang tìm bài viết với userId: {}, trang: {}, kích thước: {}", userId, pageable.getPageNumber(), pageable.getPageSize());
        Page<Post> posts;
        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
        
        // Chỉ tìm bài viết đang hiển thị (is_active = 0)
        if (userId != null) {
            posts = postRepository.findByPrivacyOrUserIdAndIsActiveFalse(Post.Privacy.PUBLIC, userId, pageable);
        } else {
            posts = postRepository.findByPrivacyAndIsActiveFalse(Post.Privacy.PUBLIC, pageable);
        }
        
        List<PostDto> postDtos = postDtoMapper.toPostDtos(posts.getContent(), reqUser);
        
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
        
        return pagedModel;
    }

    @SuppressWarnings("unlikely-arg-type")
    @Override
    @Transactional
    public PostDto updatePost(Long postId, PostDto postDto, List<MultipartFile> mediaFiles, Long userId) throws UserException {
        logger.info("Cập nhật bài viết postId: {} cho userId: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Không tìm thấy bài viết với id: " + postId));

        // Kiểm tra quyền
        if (!post.getUser().getId().equals(userId)) {
            // Kiểm tra quyền quản trị nhóm nếu bài post thuộc nhóm
            if (post.getGroup() != null) {
                GroupMember member = groupMemberRepository.findByGroupIdAndUserId(post.getGroup().getId(), userId)
                        .orElseThrow(() -> new UserException("Người dùng không phải là thành viên của nhóm"));
                if (!member.getRole().equals("ADMIN") && !member.getRole().equals("MODERATOR")) {
                    throw new UserException("Không có quyền cập nhật bài viết này");
                }
            } else {
                throw new UserException("Không có quyền cập nhật bài viết này");
            }
        }

        // Cập nhật nội dung và quyền riêng tư
        post.setContent(postDto.getContent());
        if (post.getGroup() != null) {
            // Giữ quyền riêng tư phù hợp với nhóm
            post.setPrivacy(post.getGroup().getPrivacy() == Group.Privacy.PRIVATE ? Post.Privacy.ONLY_ME : Post.Privacy.PUBLIC);
        } else {
            post.setPrivacy(Post.Privacy.valueOf(postDto.getPrivacy()));
        }

        // Xử lý media
        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            logger.info("Xử lý {} tệp media đính kèm", mediaFiles.size());
            List<PostMedia> mediaEntities = new ArrayList<>();

            // Xóa media cũ
            postMediaRepository.deleteByPostId(postId);
            post.setMedia(new ArrayList<>());

            for (MultipartFile file : mediaFiles) {
                if (file.isEmpty()) {
                    logger.warn("Bỏ qua tệp rỗng");
                    continue;
                }

                String originalFilename = file.getOriginalFilename();
                logger.info("Xử lý tệp: {}, kích thước: {}, loại: {}", 
                            originalFilename, file.getSize(), file.getContentType());

                try {
                    PostMedia.MediaType mediaType = file.getContentType().startsWith("image/") 
                            ? PostMedia.MediaType.IMAGE : PostMedia.MediaType.VIDEO;

                    String uniqueFilename = UUID.randomUUID().toString() + 
                            (originalFilename != null && originalFilename.contains(".") 
                             ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg");

                    String storagePath = mediaType == PostMedia.MediaType.VIDEO ? getVideoStoragePath() : "upload/posts";
                    File directory = new File(storagePath);
                    if (!directory.exists()) {
                        directory.mkdirs();
                    }

                    Path targetPath = Paths.get(storagePath, uniqueFilename);
                    Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                    logger.info("Đã lưu tệp tại: {}", targetPath);

                    PostMedia media = new PostMedia();
                    media.setPost(post);
                    media.setMediaType(mediaType);
                    media.setMediaUrl(targetPath.toString());
                    media.setMediaOrder(mediaEntities.size());

                    PostMedia savedMedia = postMediaRepository.save(media);
                    mediaEntities.add(savedMedia);
                    logger.info("Đã lưu thông tin media với id: {}", savedMedia.getId());

                } catch (IOException e) {
                    logger.error("Lỗi khi lưu tệp {}: {}", originalFilename, e.getMessage(), e);
                }
            }

            post.setMedia(mediaEntities);
        }

        Post updatedPost = postRepository.save(post);
        logger.info("Đã cập nhật bài viết với id: {}", updatedPost.getId());

        return postDtoMapper.toPostDto(updatedPost, userId != null ? userRepository.findById(userId).orElse(null) : null);
    }

    @SuppressWarnings("unlikely-arg-type")
    @Override
    @Transactional
    public void deletePost(Long postId, Long userId) throws UserException {
        logger.info("Ẩn bài viết với id: {} cho người dùng có id: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Không tìm thấy bài viết với id: " + postId));

        if (!post.getUser().getId().equals(userId)) {
            if (post.getGroup() != null) {
                groupMemberRepository.findByGroupIdAndUserId(post.getGroup().getId(), userId)
                        .orElseThrow(() -> new UserException("Người dùng không phải là thành viên của nhóm"));
                GroupMember member = groupMemberRepository.findByGroupIdAndUserId(post.getGroup().getId(), userId).orElse(null);
                if (member == null || (!member.getRole().equals("ADMIN") && !member.getRole().equals("MODERATOR"))) {
                    throw new UserException("Không có quyền xóa bài viết này");
                }
            } else {
                throw new UserException("Không có quyền xóa bài viết này");
            }
        }

        post.setIsActive(true);
        postRepository.save(post);
        logger.info("Bài viết với id: {} đã được ẩn", postId);
    }

    @Override
    @Transactional
    public PostDto repostPost(Long postId, Long userId) throws UserException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found"));

        if (post.getRepostUsers().stream().anyMatch(u -> u.getId().equals(userId))) {
            // Đã repost, không cần làm gì thêm
            return postDtoMapper.toPostDto(post, user);
        }

        post.getRepostUsers().add(user);
        Post savedPost = postRepository.save(post);
        return postDtoMapper.toPostDto(savedPost, user);
    }

    @Override
    @Transactional
    public PostDto unrepostPost(Long postId, Long userId) throws UserException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found"));

        // Xóa user khỏi danh sách repost
        boolean removed = post.getRepostUsers().removeIf(u -> u.getId().equals(userId));
        
        if (!removed) {
            // Người dùng chưa repost bài này
            return postDtoMapper.toPostDto(post, user);
        }
        
        Post savedPost = postRepository.save(post);
        return postDtoMapper.toPostDto(savedPost, user);
    }

    @Override
    @Transactional
    public PostDto likePost(Long postId, Long userId) throws UserException {
        logger.info("Liking post with id: {} for userId: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id: " + userId));

        likeService.likePost(postId, userId);
        return postDtoMapper.toPostDto(post, user);
    }

    @Override
    @Transactional
    public PostDto unlikePost(Long postId, Long userId) throws UserException {
        logger.info("Unliking post with id: {} for userId: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id: " + userId));

        likeService.unlikePost(postId, userId);
        return postDtoMapper.toPostDto(post, user);
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

    /**
     * Gets the configured video storage path from application.properties
     * @return the path where videos should be stored
     */
    private String getVideoStoragePath() {
        // Try to use the configured path first
        String path = this.videoStoragePath;
        
        logger.info("Configured video storage path: {}", path);
        
        try {
            // Nếu đường dẫn bắt đầu bằng dấu ".", tạo đường dẫn tuyệt đối từ thư mục làm việc hiện tại
            if (path.startsWith("./")) {
                String workingDir = System.getProperty("user.dir");
                path = workingDir + path.substring(1);
                logger.info("Resolved relative path to absolute path: {}", path);
            }
            
            // Create a File object for the path
            File directory = new File(path);
            
            // Check if the directory exists and is writable
            if (!directory.exists()) {
                logger.info("Video storage directory doesn't exist: {}, attempting to create it", path);
                boolean created = directory.mkdirs();
                if (!created) {
                    logger.warn("Failed to create video directory: {}", path);
                    // Fall back to a directory in the user's home directory
                    path = System.getProperty("java.io.tmpdir") + "/phan-lop-videos";
                    logger.info("Falling back to temporary directory: {}", path);
                    directory = new File(path);
                    directory.mkdirs();
                }
            }
            
            // Verify the final directory is writable
            if (!directory.canWrite()) {
                logger.warn("Video directory is not writable: {}", path);
                // Fall back to a directory in the temporary directory
                path = System.getProperty("java.io.tmpdir") + "/phan-lop-videos";
                logger.info("Falling back to temporary directory: {}", path);
                directory = new File(path);
                directory.mkdirs();
            }
            
            // Ensure the final directory exists
            if (!directory.exists()) {
                logger.warn("Could not create any valid video storage directory");
                throw new RuntimeException("Failed to create video storage directory");
            }
            
            logger.info("Using video storage directory: {}", path);
            return path;
        } catch (Exception e) {
            logger.error("Error setting up video storage path: {}", e.getMessage(), e);
            // Last resort - use temp directory
            String tempPath = System.getProperty("java.io.tmpdir") + "/phan-lop-videos";
            logger.info("Using emergency fallback to temp directory: {}", tempPath);
            new File(tempPath).mkdirs();
            return tempPath;
        }
    }

    @Override
    public PagedModel<?> getPostsByUserId(Long userId, Long currentUserId, Pageable pageable) throws UserException {
        logger.info("Đang tìm bài viết cho người dùng {}", userId);
        
        // Đảm bảo người dùng tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("Không tìm thấy người dùng"));
        
        // Lấy thông tin người dùng yêu cầu nếu có
        User reqUser = (currentUserId != null) ? userRepository.findById(currentUserId).orElse(null) : null;
        
        Page<Post> posts;
        // Nếu xem hồ sơ của chính mình, hiển thị tất cả bài viết đang hiển thị
        if (currentUserId != null && currentUserId.equals(userId)) {
            // Tìm bài viết theo userId và isActive = false (0)
            posts = postRepository.findByUserIdAndIsActiveFalse(userId, pageable);
            logger.info("Trả về tất cả bài viết đang hiển thị ({}) cho hồ sơ của người dùng", posts.getTotalElements());
        } 
        // Nếu xem hồ sơ của người khác, chỉ hiển thị bài viết PUBLIC và đang hiển thị
        else {
            // Tìm bài viết theo userId, privacy = PUBLIC và isActive = false (0)
            posts = postRepository.findByUserIdAndPrivacyAndIsActiveFalse(userId, Post.Privacy.PUBLIC, pageable);
            logger.info("Trả về {} bài viết công khai đang hiển thị cho hồ sơ của người dùng khác", posts.getTotalElements());
        }
        
        List<PostDto> postDtos = postDtoMapper.toPostDtos(posts.getContent(), reqUser);
        
        // Tạo paged model
        PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
            posts.getSize(),
            posts.getNumber(),
            posts.getTotalElements(),
            posts.getTotalPages()
        );
        
        PagedModel<?> pagedModel = PagedModel.of(postDtos, metadata);
        
        // Thêm links
        Link selfLink = Link.of(String.format("/api/posts/user/%d?page=%d&size=%d", userId, posts.getNumber(), posts.getSize())).withSelfRel();
        pagedModel.add(selfLink);
        
        if (posts.hasNext()) {
            Link nextLink = Link.of(String.format("/api/posts/user/%d?page=%d&size=%d", userId, posts.getNumber() + 1, posts.getSize())).withRel("next");
            pagedModel.add(nextLink);
        }
        
        if (posts.hasPrevious()) {
            Link prevLink = Link.of(String.format("/api/posts/user/%d?page=%d&size=%d", userId, posts.getNumber() - 1, posts.getSize())).withRel("prev");
            pagedModel.add(prevLink);
        }
        
        return pagedModel;
    }
    
    @Override
    public PagedModel<?> getSharedPostsByUserId(Long userId, Long currentUserId, Pageable pageable) throws UserException {
        logger.info("Đang tìm bài viết đã chia sẻ cho người dùng {}", userId);
        
        // Đảm bảo người dùng tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("Không tìm thấy người dùng"));
        
        // Lấy thông tin người dùng yêu cầu nếu có
        User reqUser = (currentUserId != null) ? userRepository.findById(currentUserId).orElse(null) : null;
        
        // Tìm bài viết đang hiển thị mà người dùng đã chia sẻ
        Page<Post> posts = postRepository.findActivePostsRepostedByUser(userId, pageable);
        logger.info("Tìm thấy {} bài viết đang hiển thị đã được chia sẻ bởi người dùng {}", posts.getTotalElements(), userId);
        
        List<PostDto> postDtos = postDtoMapper.toPostDtos(posts.getContent(), reqUser);
        
        // Tạo paged model
        PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
            posts.getSize(),
            posts.getNumber(),
            posts.getTotalElements(),
            posts.getTotalPages()
        );
        
        PagedModel<?> pagedModel = PagedModel.of(postDtos, metadata);
        
        // Thêm links
        Link selfLink = Link.of(String.format("/api/posts/user/%d/shared?page=%d&size=%d", 
            userId, posts.getNumber(), posts.getSize())).withSelfRel();
        pagedModel.add(selfLink);
        
        if (posts.hasNext()) {
            Link nextLink = Link.of(String.format("/api/posts/user/%d/shared?page=%d&size=%d", 
                userId, posts.getNumber() + 1, posts.getSize())).withRel("next");
            pagedModel.add(nextLink);
        }
        
        if (posts.hasPrevious()) {
            Link prevLink = Link.of(String.format("/api/posts/user/%d/shared?page=%d&size=%d", 
                userId, posts.getNumber() - 1, posts.getSize())).withRel("prev");
            pagedModel.add(prevLink);
        }
        
        return pagedModel;
    }

    @Override
    public PagedModel<?> searchPosts(String query, Long userId, Pageable pageable) {
        logger.info("Tìm kiếm bài viết với từ khóa: '{}', userId: {}, trang: {}, kích thước: {}", 
                    query, userId, pageable.getPageNumber(), pageable.getPageSize());
        
        Page<Post> posts;
        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
        
        if (userId != null) {
            // Người dùng đã xác thực: hiển thị bài viết công khai đang hiển thị và bài viết của họ đang hiển thị
            posts = postRepository.searchActivePostsForUser(query, Post.Privacy.PUBLIC, userId, pageable);
            logger.info("Tìm thấy {} bài viết đang hiển thị phù hợp với từ khóa cho người dùng đã xác thực", posts.getTotalElements());
        } else {
            // Người dùng ẩn danh: chỉ hiển thị bài viết công khai đang hiển thị
            posts = postRepository.searchActivePublicPosts(query, Post.Privacy.PUBLIC, pageable);
            logger.info("Tìm thấy {} bài viết công khai đang hiển thị phù hợp với từ khóa cho người dùng ẩn danh", posts.getTotalElements());
        }
        
        List<PostDto> postDtos = postDtoMapper.toPostDtos(posts.getContent(), reqUser);
        
        // Tạo paged model
        PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
            posts.getSize(),
            posts.getNumber(),
            posts.getTotalElements(),
            posts.getTotalPages()
        );
        
        PagedModel<?> pagedModel = PagedModel.of(postDtos, metadata);
        
        // Thêm links
        Link selfLink = Link.of(String.format("/api/posts/search?query=%s&page=%d&size=%d", 
            query, posts.getNumber(), posts.getSize())).withSelfRel();
        pagedModel.add(selfLink);
        
        if (posts.hasNext()) {
            Link nextLink = Link.of(String.format("/api/posts/search?query=%s&page=%d&size=%d", 
                query, posts.getNumber() + 1, posts.getSize())).withRel("next");
            pagedModel.add(nextLink);
        }
        
        if (posts.hasPrevious()) {
            Link prevLink = Link.of(String.format("/api/posts/search?query=%s&page=%d&size=%d", 
                query, posts.getNumber() - 1, posts.getSize())).withRel("prev");
            pagedModel.add(prevLink);
        }
        
        return pagedModel;
    }
    
    /**
     * Trả về đối tượng Post entity theo ID
     * @param postId ID của bài viết cần lấy
     * @return Đối tượng Post entity
     * @throws UserException nếu không tìm thấy bài viết
     */
    @Override
    public Post getPostEntityById(Long postId) throws UserException {
        logger.info("Fetching post entity with id: {}", postId);
        return postRepository.findById(postId)
            .orElseThrow(() -> new UserException("Post not found with id: " + postId));
    }

    @Override
    @Transactional
    public PostDto createPost(PostDto postDto, List<MultipartFile> mediaFiles, Long userId) throws UserException {
        logger.info("Tạo bài viết mới cho người dùng có id: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("Không tìm thấy người dùng"));

        // Kiểm tra quyền truy cập nhóm nếu có groupId
        Group group = null;
        if (postDto.getGroupId() != null) {
            group = groupRepository.findById(postDto.getGroupId().longValue())
                    .orElseThrow(() -> new UserException("Không tìm thấy nhóm"));
            GroupMember member = groupMemberRepository.findByGroupIdAndUserId(postDto.getGroupId().longValue(), userId)
                    .orElseThrow(() -> new UserException("Bạn không phải là thành viên của nhóm này"));
        }

        Post post = new Post();
        post.setUser(user);
        post.setContent(postDto.getContent());
        post.setCreatedAt(java.time.LocalDateTime.now());
        post.setIsActive(false);
        post.setGroup(group); // Liên kết bài viết với nhóm nếu có

        // Đặt quyền riêng tư
        if (postDto.getGroupId() != null) {
            // Nếu là bài viết nhóm, quyền riêng tư phải phù hợp với nhóm
            post.setPrivacy(group.getPrivacy() == Group.Privacy.PRIVATE ? Post.Privacy.ONLY_ME : Post.Privacy.PUBLIC);
        } else {
            // Bài viết thông thường
            if (postDto.getPrivacy() != null) {
                try {
                    post.setPrivacy(Post.Privacy.valueOf(postDto.getPrivacy()));
                } catch (IllegalArgumentException e) {
                    logger.warn("Giá trị quyền riêng tư không hợp lệ: {}, sử dụng giá trị mặc định PUBLIC", postDto.getPrivacy());
                    post.setPrivacy(Post.Privacy.PUBLIC);
                }
            } else {
                post.setPrivacy(Post.Privacy.PUBLIC);
            }
        }

        // Lưu post để có id khi xử lý media
        Post savedPost = postRepository.save(post);
        logger.info("Đã lưu bài viết với id: {}", savedPost.getId());

        // Xử lý các tệp media nếu có
        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            logger.info("Xử lý {} tệp media đính kèm", mediaFiles.size());
            List<PostMedia> mediaEntities = new ArrayList<>();

            for (MultipartFile file : mediaFiles) {
                if (file.isEmpty()) {
                    logger.warn("Bỏ qua tệp rỗng");
                    continue;
                }

                String originalFilename = file.getOriginalFilename();
                logger.info("Xử lý tệp: {}, kích thước: {}, loại: {}", 
                    originalFilename, file.getSize(), file.getContentType());

                try {
                    PostMedia.MediaType mediaType;
                    if (file.getContentType() != null) {
                        if (file.getContentType().startsWith("image/")) {
                            mediaType = PostMedia.MediaType.IMAGE;
                        } else if (file.getContentType().startsWith("video/")) {
                            mediaType = PostMedia.MediaType.VIDEO;
                        } else {
                            mediaType = PostMedia.MediaType.IMAGE;
                        }
                    } else {
                        if (originalFilename != null && 
                            (originalFilename.endsWith(".jpg") || originalFilename.endsWith(".jpeg") || 
                             originalFilename.endsWith(".png") || originalFilename.endsWith(".gif"))) {
                            mediaType = PostMedia.MediaType.IMAGE;
                        } else if (originalFilename != null && 
                                 (originalFilename.endsWith(".mp4") || originalFilename.endsWith(".avi") || 
                                  originalFilename.endsWith(".mov") || originalFilename.endsWith(".wmv"))) {
                            mediaType = PostMedia.MediaType.VIDEO;
                        } else {
                            mediaType = PostMedia.MediaType.IMAGE;
                        }
                    }

                    String uniqueFilename = UUID.randomUUID().toString();
                    String fileExtension = "";

                    if (originalFilename != null && originalFilename.contains(".")) {
                        fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    } else if (file.getContentType() != null) {
                        if (file.getContentType().equals("image/jpeg")) fileExtension = ".jpg";
                        else if (file.getContentType().equals("image/png")) fileExtension = ".png";
                        else if (file.getContentType().equals("video/mp4")) fileExtension = ".mp4";
                        else fileExtension = "." + file.getContentType().split("/")[1];
                    }

                    uniqueFilename = uniqueFilename + fileExtension;

                    String storagePath;
                    if (mediaType == PostMedia.MediaType.VIDEO) {
                        storagePath = getVideoStoragePath();
                    } else {
                        storagePath = "upload/posts";
                        File directory = new File(storagePath);
                        if (!directory.exists()) {
                            directory.mkdirs();
                        }
                    }

                    Path targetPath = Paths.get(storagePath, uniqueFilename);
                    Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                    logger.info("Đã lưu tệp tại: {}", targetPath);

                    PostMedia media = new PostMedia();
                    media.setPost(savedPost);
                    media.setMediaType(mediaType);
                    media.setMediaUrl(targetPath.toString());
                    media.setMediaOrder(mediaEntities.size());

                    PostMedia savedMedia = postMediaRepository.save(media);
                    mediaEntities.add(savedMedia);
                    logger.info("Đã lưu thông tin media với id: {}", savedMedia.getId());

                } catch (IOException e) {
                    logger.error("Lỗi khi lưu tệp {}: {}", originalFilename, e.getMessage(), e);
                }
            }

            savedPost.setMedia(mediaEntities);
        } else {
            logger.info("Không có tệp media nào được tải lên");
        }

        // Tải lại post từ cơ sở dữ liệu để đảm bảo có tất cả dữ liệu
        Post finalPost = postRepository.findById(savedPost.getId())
                .orElseThrow(() -> new UserException("Không thể tìm thấy bài viết vừa tạo"));

        return postDtoMapper.toPostDto(finalPost, user);
    }

    @Override
    public PagedModel<?> getGroupPosts(Long groupId, Long userId, Pageable pageable) throws UserException {
        logger.info("Fetching posts for group {}, userId: {}, page: {}, size: {}", 
                    groupId, userId, pageable.getPageNumber(), pageable.getPageSize());

        // Kiểm tra nhóm tồn tại
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new UserException("Group not found"));

        // Kiểm tra quyền truy cập nhóm
        if (userId != null) {
            groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                    .orElseThrow(() -> new UserException("You are not a member of this group"));
        } else if (group.getPrivacy() == Group.Privacy.PRIVATE) {
            throw new UserException("Cannot access private group without authentication");
        }

        // Lấy bài viết đang hiển thị của nhóm (sửa điều kiện isActive)
        Page<Post> posts = postRepository.findByGroupIdAndIsActiveTrue(groupId, pageable);
        User reqUser = userId != null ? userRepository.findById(userId).orElse(null) : null;

        List<PostDto> postDtos = postDtoMapper.toPostDtos(posts.getContent(), reqUser);

        PagedModel.PageMetadata metadata = new PagedModel.PageMetadata(
                pageable.getPageSize(),
                posts.getNumber(),
                posts.getTotalElements(),
                posts.getTotalPages()
        );

        PagedModel<PostDto> pagedModel = PagedModel.of(postDtos, metadata);

        // Thêm links HATEOAS
        String basePath = String.format("/api/posts/group/%d", groupId);
        pagedModel.add(Link.of(basePath + String.format("?page=%d&size=%d", 
                posts.getNumber(), posts.getSize())).withSelfRel());

        if (posts.hasNext()) {
            pagedModel.add(Link.of(basePath + String.format("?page=%d&size=%d", 
                    posts.getNumber() + 1, posts.getSize())).withRel("next"));
        }

        if (posts.hasPrevious()) {
            pagedModel.add(Link.of(basePath + String.format("?page=%d&size=%d", 
                    posts.getNumber() - 1, posts.getSize())).withRel("prev"));
        }

        return pagedModel;
    }
}