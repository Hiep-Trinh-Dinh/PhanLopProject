package com.example.server.services;

import com.example.server.dto.PostDto;
import com.example.server.exception.UserException;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedModel;
import org.springframework.web.multipart.MultipartFile;

public interface PostService {
    public PostDto createPost(PostDto postDto, List<MultipartFile> mediaFiles, Long userId) throws UserException;
    PostDto getPostById(Long postId, Long reqUserId) throws UserException;
    public PagedModel<?> getAllPosts(Long userId, Pageable pageable) throws UserException; // Thêm phân trang
    PostDto updatePost(Long postId, PostDto postDto, Long userId) throws UserException;
    void deletePost(Long postId, Long userId) throws UserException;
    PostDto repostPost(Long postId, Long userId) throws UserException;
    PostDto likePost(Long postId, Long userId) throws UserException;
    PostDto unlikePost(Long postId, Long userId) throws UserException;
}