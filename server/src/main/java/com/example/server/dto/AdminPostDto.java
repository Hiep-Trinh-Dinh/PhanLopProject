package com.example.server.dto;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.server.models.Post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminPostDto implements Serializable {
    
    private Long id;
    private String content;
    private String privacy;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // User who created the post
    private Long userId;
    private String username;
    private String userFullName;
    private String userProfilePicture;
    
    // Post stats
    private int likeCount;
    private int commentCount;
    private int shareCount;
    
    // Media attached to the post
    @Builder.Default
    private List<PostMediaDto> media = new ArrayList<>();
    
    // For managing purposes
    private String reportCount;
    private String status; // active, inactive
    private String moderationStatus; // approved, pending, rejected
    private String moderationReason;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostMediaDto implements Serializable {
        private Long id;
        private String url;
        private String mediaType; // "IMAGE" hoặc "VIDEO"
    }
    
    /**
     * Chuyển đổi từ Post entity sang AdminPostDto
     */
    public static AdminPostDto fromEntity(Post post) {
        if (post == null) return null;
        
        AdminPostDto dto = new AdminPostDto();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        
        // Thông tin người dùng tạo bài viết
        if (post.getUser() != null) {
            dto.setUserId(post.getUser().getId());
            
            // Kết hợp firstName và lastName
            String userName = (post.getUser().getFirstName() != null ? post.getUser().getFirstName() : "") +
                             " " +
                             (post.getUser().getLastName() != null ? post.getUser().getLastName() : "");
            dto.setUsername(post.getUser().getUsername() != null ? post.getUser().getUsername() : userName.trim().toLowerCase().replace(" ", ""));
            
            dto.setUserFullName(userName.trim());
            dto.setUserProfilePicture(post.getUser().getImage());
        }
        
        // Số liệu thống kê
        dto.setLikeCount(post.getLikes() != null ? post.getLikes().size() : 0);
        dto.setCommentCount(post.getComments() != null ? post.getComments().size() : 0);
        dto.setShareCount(post.getRepostUsers() != null ? post.getRepostUsers().size() : 0);
        
        // Privacy và trạng thái
        dto.setPrivacy(post.getPrivacy().toString());
        dto.setActive(post.getIsActive());
        dto.setStatus(post.getIsActive() ? "active" : "inactive");
        
        // Thiết lập moderation status mặc định
        dto.setModerationStatus("approved");
        
        // Thời gian
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        
        // Media
        if (post.getMedia() != null && !post.getMedia().isEmpty()) {
            List<PostMediaDto> mediaDtos = new ArrayList<>();
            
            post.getMedia().forEach(media -> {
                PostMediaDto mediaDto = new PostMediaDto();
                mediaDto.setId(media.getId());
                mediaDto.setUrl(media.getMediaUrl());
                mediaDto.setMediaType(media.getMediaType().toString());
                mediaDtos.add(mediaDto);
            });
            
            dto.setMedia(mediaDtos);
        }
        
        // Mặc định cho reportCount
        dto.setReportCount("0");
        
        return dto;
    }
} 