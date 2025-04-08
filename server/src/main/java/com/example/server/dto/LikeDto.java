package com.example.server.dto;

import lombok.Data;

@Data
public class LikeDto {
    private Long id;
    private UserDto user;
    private Long postId; // ID bài đăng được thích (null nếu là bình luận)
    private Long commentId; // ID bình luận được thích (null nếu là bài đăng)
}