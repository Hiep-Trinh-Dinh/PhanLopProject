package com.example.server.services;

import com.example.server.dto.CommentDto;
import java.util.List;

public interface CommentService {
    CommentDto createComment(CommentDto commentDto, Long postId, Long userId);
    
    CommentDto createReply(CommentDto commentDto, Long postId, Long parentCommentId, Long userId);
    
    CommentDto getCommentById(Long commentId, Long reqUserId);
    
    List<CommentDto> getCommentsByPostId(Long postId, Long reqUserId);
    
    CommentDto updateComment(Long commentId, CommentDto commentDto, Long userId);
    
    void deleteComment(Long commentId, Long userId);
    
    CommentDto likeComment(Long commentId, Long userId);
    
    CommentDto unlikeComment(Long commentId, Long userId);
}