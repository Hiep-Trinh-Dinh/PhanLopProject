package com.example.server.services.impl;

import com.example.server.dto.LikeDto;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public LikeDto likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike.isEmpty()) {
            Like like = new Like();
            like.setUser(user);
            like.setPost(post);
            Like savedLike = likeRepository.save(like);
            return LikeDtoMapper.toLikeDto(savedLike, user);
        }
        
        return LikeDtoMapper.toLikeDto(existingLike.get(), user);
    }

    @Override
    public LikeDto likeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found with ID: " + commentId));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        Optional<Like> existingLike = likeRepository.findByCommentIdAndUserId(commentId, userId);
        if (existingLike.isEmpty()) {
            Like like = new Like();
            like.setUser(user);
            like.setComment(comment);
            Like savedLike = likeRepository.save(like);
            return LikeDtoMapper.toLikeDto(savedLike, user);
        }
        
        return LikeDtoMapper.toLikeDto(existingLike.get(), user);
    }

    @Override
    public void unlikePost(Long postId, Long userId) {
        postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        
        userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        likeRepository.deleteByPostIdAndUserId(postId, userId);
    }

    @Override
    public void unlikeComment(Long commentId, Long userId) {
        commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found with ID: " + commentId));
        
        userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        likeRepository.deleteByCommentIdAndUserId(commentId, userId);
    }

    @Override
    public List<LikeDto> getLikesByPostId(Long postId, Long reqUserId) {
        postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new RuntimeException("Requesting user not found with ID: " + reqUserId));
        
        List<Like> likes = likeRepository.findByPostId(postId);
        return LikeDtoMapper.toLikeDtos(likes, reqUser);
    }

    @Override
    public List<LikeDto> getLikesByCommentId(Long commentId, Long reqUserId) {
        commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found with ID: " + commentId));
        
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new RuntimeException("Requesting user not found with ID: " + reqUserId));
        
        List<Like> likes = likeRepository.findByCommentId(commentId);
        return LikeDtoMapper.toLikeDtos(likes, reqUser);
    }
}