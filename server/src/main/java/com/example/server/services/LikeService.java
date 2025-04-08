package com.example.server.services;

import java.util.List;
import com.example.server.dto.LikeDto;

public interface LikeService {
    LikeDto likePost(Long postId, Long userId);
    
    LikeDto likeComment(Long commentId, Long userId);
    
    void unlikePost(Long postId, Long userId);
    
    void unlikeComment(Long commentId, Long userId);
    
    List<LikeDto> getLikesByPostId(Long postId, Long reqUserId);
    
    List<LikeDto> getLikesByCommentId(Long commentId, Long reqUserId);
}