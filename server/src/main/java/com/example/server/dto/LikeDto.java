package com.example.server.dto;

import java.io.Serializable;

import lombok.Data;

@Data
public class LikeDto implements Serializable{
    private Long id;
    private UserDto user;
    private Long postId; // ID bài đăng được thích (null nếu là bình luận)
    private Long commentId; // ID bình luận được thích (null nếu là bài đăng)
}