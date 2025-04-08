package com.example.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private Long id;
    private String content;
    private UserDto user;
    private List<MediaDto> media;
    private String privacy; // "PUBLIC", "FRIENDS", "ONLY_ME"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Thông tin tương tác
    private int totalLikes;
    private boolean liked; // Người dùng yêu cầu có thích không
    private int totalReposts;
    private boolean reposted; // Người dùng yêu cầu có repost không
    private List<Long> repostUserIds; // Danh sách ID người repost

    // Thông tin bình luận
    private long totalComments;
    private List<CommentDto> previewComments; // 2 bình luận mới nhất
    private List<CommentDto> comments; // Toàn bộ bình luận (khi cần)

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaDto {
        private String mediaType; // "IMAGE" hoặc "VIDEO"
        private String url;
    }
}