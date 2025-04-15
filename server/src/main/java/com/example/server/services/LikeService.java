package com.example.server.services;

import java.util.List;
import com.example.server.dto.LikeDto;
import com.example.server.exception.UserException;

public interface LikeService {
    LikeDto likePost(Long postId, Long userId) throws UserException;
    
    LikeDto likeComment(Long commentId, Long userId) throws UserException;
    
    void unlikePost(Long postId, Long userId) throws UserException;
    
    void unlikeComment(Long commentId, Long userId) throws UserException;
    
    List<LikeDto> getLikesByPostId(Long postId, Long reqUserId) throws UserException;
    
    List<LikeDto> getLikesByCommentId(Long commentId, Long reqUserId) throws UserException;
}