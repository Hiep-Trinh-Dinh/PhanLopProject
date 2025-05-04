package com.example.server.services.impl;

import com.example.server.dto.LikeDto;
import com.example.server.exception.UserException;
import com.example.server.mapper.LikeDtoMapper;
import com.example.server.models.Comment;
import com.example.server.models.Like;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.repositories.CommentRepository;
import com.example.server.repositories.LikeRepository;
import com.example.server.repositories.PostRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.LikeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LikeServiceImpl implements LikeService {

    private static final Logger logger = LoggerFactory.getLogger(LikeServiceImpl.class);

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeDtoMapper likeDtoMapper;

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public LikeDto likePost(Long postId, Long userId) throws UserException {
        logger.info("User {} liking post {}", userId, postId);

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));

        // Kiểm tra quyền truy cập post
        if (!canViewPost(post, user)) {
            throw new UserException("You do not have permission to like this post");
        }
        
        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike.isEmpty()) {
            Like like = new Like();
            like.setUser(user);
            like.setPost(post);
            Like savedLike = likeRepository.save(like);
            return likeDtoMapper.toLikeDto(savedLike, user);
        }
        
        return likeDtoMapper.toLikeDto(existingLike.get(), user);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public LikeDto likeComment(Long commentId, Long userId) throws UserException {
        logger.info("User {} liking comment {}", userId, commentId);

        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new UserException("Comment not found with id: " + commentId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));

        // Kiểm tra quyền truy cập post của comment
        Post post = comment.getPost();
        if (!canViewPost(post, user)) {
            throw new UserException("You do not have permission to like this comment");
        }
        
        Optional<Like> existingLike = likeRepository.findByCommentIdAndUserId(commentId, userId);
        if (existingLike.isEmpty()) {
            Like like = new Like();
            like.setUser(user);
            like.setComment(comment);
            Like savedLike = likeRepository.save(like);
            return likeDtoMapper.toLikeDto(savedLike, user);
        }
        
        return likeDtoMapper.toLikeDto(existingLike.get(), user);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public void unlikePost(Long postId, Long userId) throws UserException {
        logger.info("User {} unliking post {}", userId, postId);

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));

        if (!canViewPost(post, user)) {
            throw new UserException("You do not have permission to unlike this post");
        }
        
        likeRepository.deleteByPostIdAndUserId(postId, userId);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public void unlikeComment(Long commentId, Long userId) throws UserException {
        logger.info("User {} unliking comment {}", userId, commentId);

        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new UserException("Comment not found with id: " + commentId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));

        Post post = comment.getPost();
        if (!canViewPost(post, user)) {
            throw new UserException("You do not have permission to unlike this comment");
        }
        
        likeRepository.deleteByCommentIdAndUserId(commentId, userId);
    }

    @Override
    @Cacheable(value = "likes", key = "'post_' + #postId")
    public List<LikeDto> getLikesByPostId(Long postId, Long reqUserId) throws UserException {
        logger.info("Fetching likes for post {}", postId);

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new UserException("Requesting user not found with id: " + reqUserId));

        if (!canViewPost(post, reqUser)) {
            throw new UserException("You do not have permission to view likes of this post");
        }
        
        List<Like> likes = likeRepository.findByPostId(postId);
        return likeDtoMapper.toLikeDtos(likes, reqUser);
    }

    @Override
    @Cacheable(value = "likes", key = "'comment_' + #commentId")
    public List<LikeDto> getLikesByCommentId(Long commentId, Long reqUserId) throws UserException {
        logger.info("Fetching likes for comment {}", commentId);

        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new UserException("Comment not found with id: " + commentId));
        
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new UserException("Requesting user not found with id: " + reqUserId));

        Post post = comment.getPost();
        if (!canViewPost(post, reqUser)) {
            throw new UserException("You do not have permission to view likes of this comment");
        }
        
        List<Like> likes = likeRepository.findByCommentId(commentId);
        return likeDtoMapper.toLikeDtos(likes, reqUser);
    }

    private boolean canViewPost(Post post, User user) {
        switch (post.getPrivacy()) {
            case PUBLIC:
                return true;
            case FRIENDS:
                return post.getUser().getFriends().contains(user);
            case ONLY_ME:
                return post.getUser().getId().equals(user.getId());
            default:
                return false;
        }
    }
}