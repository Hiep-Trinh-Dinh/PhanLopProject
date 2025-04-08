package com.example.server.services;

import java.util.List;

import com.example.server.dto.PostDto;

public interface PostService {
    PostDto createPost(PostDto postDto, Long userId);

    PostDto getPostById(Long postId, Long reqUserId);

    List<PostDto> getAllPosts(Long reqUserId);
    
    PostDto updatePost(Long postId, PostDto postDto, Long userId);
    
    void deletePost(Long postId, Long userId);
    
    PostDto repostPost(Long postId, Long userId);
    
    PostDto unlikePost(Long postId, Long userId);
    
    PostDto likePost(Long postId, Long userId);
}