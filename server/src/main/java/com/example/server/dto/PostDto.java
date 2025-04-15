package com.example.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto implements Serializable{
    private Long id;
    private String content;
    private UserDto user;
    private List<MediaDto> media = new ArrayList<>();
    private String privacy; // "PUBLIC", "FRIENDS", "ONLY_ME"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Thông tin tương tác
    private int totalLikes;
    private boolean liked; // Người dùng yêu cầu có thích không
    private int totalReposts;
    private boolean reposted; // Người dùng yêu cầu có repost không
    private List<Long> repostUserIds = new ArrayList<>(); // Danh sách ID người repost

    // Thông tin bình luận
    private long totalComments;
    private List<CommentDto> previewComments = new ArrayList<>(); // 2 bình luận mới nhất
    private List<CommentDto> comments = new ArrayList<>(); // Toàn bộ bình luận (khi cần)

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaDto {
        private String mediaType; // "IMAGE" hoặc "VIDEO"
        private String url;
    }
}