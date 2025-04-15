package com.example.server.services.impl;

import com.example.server.dto.CommentDto;
import com.example.server.exception.UserException;
import com.example.server.mapper.CommentDtoMapper;
import com.example.server.models.Comment;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.repositories.CommentRepository;
import com.example.server.repositories.PostRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.CommentService;
import com.example.server.services.LikeService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    private static final Logger logger = LoggerFactory.getLogger(CommentServiceImpl.class);

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeService likeService;

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public CommentDto createComment(CommentDto commentDto, Long postId, Long userId) throws UserException {
        logger.info("User {} creating comment on post {}", userId, postId);

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));

        if (!canViewPost(post, user)) {
            throw new UserException("You do not have permission to comment on this post");
        }

        if (commentDto.getContent() == null || commentDto.getContent().trim().isEmpty()) {
            throw new UserException("Comment content cannot be empty");
        }

        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        comment.setUser(user);
        comment.setPost(post);
        
        // Xử lý media
        if (commentDto.getMedia() != null) {
            commentDto.getMedia().forEach(mediaDto -> {
                Comment.CommentMedia media = new Comment.CommentMedia();
                media.setMediaType(Comment.CommentMedia.MediaType.valueOf(mediaDto.getMediaType()));
                media.setUrl(mediaDto.getUrl());
                comment.getMedia().add(media);
            });
        }

        Comment savedComment = commentRepository.save(comment);
        return CommentDtoMapper.toCommentDto(savedComment, user);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public CommentDto createReply(CommentDto commentDto, Long postId, Long parentCommentId, Long userId) throws UserException {
        logger.info("User {} creating reply to comment {} on post {}", userId, parentCommentId, postId);

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        Comment parentComment = commentRepository.findById(parentCommentId)
            .orElseThrow(() -> new UserException("Parent comment not found with id: " + parentCommentId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));

        if (!canViewPost(post, user)) {
            throw new UserException("You do not have permission to reply to this comment");
        }

        if (commentDto.getContent() == null || commentDto.getContent().trim().isEmpty()) {
            throw new UserException("Reply content cannot be empty");
        }

        Comment reply = new Comment();
        reply.setContent(commentDto.getContent());
        reply.setUser(user);
        reply.setPost(post);
        reply.setParentComment(parentComment);
        
        // Xử lý media
        if (commentDto.getMedia() != null) {
            commentDto.getMedia().forEach(mediaDto -> {
                Comment.CommentMedia media = new Comment.CommentMedia();
                media.setMediaType(Comment.CommentMedia.MediaType.valueOf(mediaDto.getMediaType()));
                media.setUrl(mediaDto.getUrl());
                reply.getMedia().add(media);
            });
        }

        Comment savedReply = commentRepository.save(reply);
        return CommentDtoMapper.toCommentDto(savedReply, user);
    }

    @Override
    @Cacheable(value = "comments", key = "#commentId")
    public CommentDto getCommentById(Long commentId, Long reqUserId) throws UserException {
        logger.info("Fetching comment {} for user {}", commentId, reqUserId);

        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new UserException("Comment not found with id: " + commentId));
        
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new UserException("Requesting user not found with id: " + reqUserId));

        Post post = comment.getPost();
        if (!canViewPost(post, reqUser)) {
            throw new UserException("You do not have permission to view this comment");
        }

        return CommentDtoMapper.toCommentDtoWithReplies(comment, reqUser);
    }

    @Override
    public List<CommentDto> getCommentsByPostId(Long postId, Long reqUserId) throws UserException {
        logger.info("Fetching comments for post {} for user {}", postId, reqUserId);

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new UserException("Post not found with id: " + postId));
        
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new UserException("Requesting user not found with id: " + reqUserId));

        if (!canViewPost(post, reqUser)) {
            throw new UserException("You do not have permission to view comments of this post");
        }

        return CommentDtoMapper.toCommentDtos(post.getComments(), reqUser);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public CommentDto updateComment(Long commentId, CommentDto commentDto, Long userId) throws UserException {
        logger.info("User {} updating comment {}", userId, commentId);

        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new UserException("Comment not found with id: " + commentId));
        
        if (!comment.getUser().getId().equals(userId)) {
            throw new UserException("You are not authorized to update this comment");
        }

        if (commentDto.getContent() == null || commentDto.getContent().trim().isEmpty()) {
            throw new UserException("Comment content cannot be empty");
        }

        comment.setContent(commentDto.getContent());
        
        Comment updatedComment = commentRepository.save(comment);
        return CommentDtoMapper.toCommentDto(updatedComment, userRepository.findById(userId).get());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public void deleteComment(Long commentId, Long userId) throws UserException {
        logger.info("User {} deleting comment {}", userId, commentId);

        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new UserException("Comment not found with id: " + commentId));
        
        if (!comment.getUser().getId().equals(userId)) {
            throw new UserException("You are not authorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public CommentDto likeComment(Long commentId, Long userId) throws UserException {
        logger.info("User {} liking comment {}", userId, commentId);

        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new UserException("Comment not found with id: " + commentId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));

        if (!canViewPost(comment.getPost(), user)) {
            throw new UserException("You do not have permission to like this comment");
        }

        likeService.likeComment(commentId, userId);
        return CommentDtoMapper.toCommentDto(comment, user);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "comments"}, allEntries = true)
    public CommentDto unlikeComment(Long commentId, Long userId) throws UserException {
        logger.info("User {} unliking comment {}", userId, commentId);

        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new UserException("Comment not found with id: " + commentId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserException("User not found with id: " + userId));

        if (!canViewPost(comment.getPost(), user)) {
            throw new UserException("You do not have permission to unlike this comment");
        }

        likeService.unlikeComment(commentId, userId);
        return CommentDtoMapper.toCommentDto(comment, user);
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