package com.example.server.services;

import com.example.server.dto.PostDto;
import com.example.server.exception.UserException;
import com.example.server.models.Post;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedModel;
import org.springframework.web.multipart.MultipartFile;

public interface PostService {
    PostDto createPost(PostDto postDto, List<MultipartFile> mediaFiles, Long userId) throws UserException;
    PostDto getPostById(Long postId, Long reqUserId) throws UserException;
    public PagedModel<?> getAllPosts(Long userId, Pageable pageable) throws UserException; // Thêm phân trang
    PostDto updatePost(Long postId, PostDto postDto, List<MultipartFile> mediaFiles, Long userId) throws UserException;
    void deletePost(Long postId, Long userId) throws UserException;
    PostDto repostPost(Long postId, Long userId) throws UserException;
    PostDto unrepostPost(Long postId, Long userId) throws UserException;
    PostDto likePost(Long postId, Long userId) throws UserException;
    PostDto unlikePost(Long postId, Long userId) throws UserException;
    
    // New method to get posts by user ID
    PagedModel<?> getPostsByUserId(Long userId, Long currentUserId, Pageable pageable) throws UserException;
    
    PagedModel<?> getSharedPostsByUserId(Long userId, Long currentUserId, Pageable pageable) throws UserException;
    
    // Search posts by content
    PagedModel<?> searchPosts(String query, Long userId, Pageable pageable);
    
    // Lấy Post entity theo ID
    Post getPostEntityById(Long postId) throws UserException;

    public PagedModel<?> getGroupPosts(Long groupId, Long userId, Pageable pageable) throws UserException;
}