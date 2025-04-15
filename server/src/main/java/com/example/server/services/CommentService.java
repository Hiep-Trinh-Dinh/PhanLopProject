package com.example.server.services;

import com.example.server.dto.CommentDto;
import com.example.server.exception.UserException;

import java.util.List;

public interface CommentService {
    CommentDto createComment(CommentDto commentDto, Long postId, Long userId) throws UserException;
    
    CommentDto createReply(CommentDto commentDto, Long postId, Long parentCommentId, Long userId) throws UserException;
    
    CommentDto getCommentById(Long commentId, Long reqUserId)throws UserException;
    
    List<CommentDto> getCommentsByPostId(Long postId, Long reqUserId) throws UserException;
    
    CommentDto updateComment(Long commentId, CommentDto commentDto, Long userId) throws UserException;
    
    void deleteComment(Long commentId, Long userId) throws UserException;
    
    CommentDto likeComment(Long commentId, Long userId) throws UserException;
    
    CommentDto unlikeComment(Long commentId, Long userId) throws UserException;
}