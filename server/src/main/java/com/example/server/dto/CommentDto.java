package com.example.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto implements Serializable {
    private Long id;
    private String content;
    private UserDto user;
    private List<MediaDto> media;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long parentId; // ID của comment cha nếu đây là reply

    // Thông tin tương tác
    private int totalLikes;
    private boolean liked; // Người dùng yêu cầu có thích không
    private long replyCount; // Số lượng phản hồi

    // Danh sách phản hồi (nếu cần)
    private List<CommentDto> replies;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MediaDto {
        private String mediaType; // "IMAGE" hoặc "VIDEO"
        private String url;
    }
}