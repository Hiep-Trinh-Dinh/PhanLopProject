package com.example.server.services.impl;

import com.example.server.dto.CommentDto;
import com.example.server.mapper.CommentDtoMapper;
import com.example.server.models.Comment;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.repositories.CommentRepository;
import com.example.server.repositories.PostRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.CommentService;
import com.example.server.services.LikeService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeService likeService;

    @Override
    public CommentDto createComment(CommentDto commentDto, Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        comment.setUser(user);
        comment.setPost(post);
        
        Comment savedComment = commentRepository.save(comment);
        return CommentDtoMapper.toCommentDto(savedComment, user);
    }

    @Override
    public CommentDto createReply(CommentDto commentDto, Long postId, Long parentCommentId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment parentComment = commentRepository.findById(parentCommentId)
            .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment reply = new Comment();
        reply.setContent(commentDto.getContent());
        reply.setUser(user);
        reply.setPost(post);
        reply.setParentComment(parentComment);
        
        Comment savedReply = commentRepository.save(reply);
        return CommentDtoMapper.toCommentDto(savedReply, user);
    }

    @Override
    public CommentDto getCommentById(Long commentId, Long reqUserId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new RuntimeException("Requesting user not found"));
        
        return CommentDtoMapper.toCommentDtoWithReplies(comment, reqUser);
    }

    @Override
    public List<CommentDto> getCommentsByPostId(Long postId, Long reqUserId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new RuntimeException("Requesting user not found"));
        
        return CommentDtoMapper.toCommentDtos(post.getComments(), reqUser);
    }

    @Override
    public CommentDto updateComment(Long commentId, CommentDto commentDto, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        User reqUser = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        comment.setContent(commentDto.getContent());
        
        Comment updatedComment = commentRepository.save(comment);
        return CommentDtoMapper.toCommentDto(updatedComment, reqUser);
    }

    @Override
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        commentRepository.delete(comment);
    }

    @Override
    public CommentDto likeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        likeService.likeComment(commentId, userId); // Gọi LikeService
        
        return CommentDtoMapper.toCommentDto(comment, user); // Trả về CommentDto
    }

    @Override
    public CommentDto unlikeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        likeService.unlikeComment(commentId, userId); // Gọi LikeService
        
        return CommentDtoMapper.toCommentDto(comment, user); // Trả về CommentDto
    }
}