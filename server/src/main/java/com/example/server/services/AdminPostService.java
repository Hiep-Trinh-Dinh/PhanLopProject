package com.example.server.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.server.dto.AdminPostDto;
import com.example.server.models.Post;
import com.example.server.exception.UserException;

public interface AdminPostService {
    /**
     * Lấy danh sách bài viết có phân trang và lọc theo trạng thái
     */
    Page<AdminPostDto> getAllPosts(Pageable pageable, String query, String status);
    
    /**
     * Lấy thông tin chi tiết của bài viết theo ID
     */
    AdminPostDto getPostById(Long id);
    
    /**
     * Cập nhật thông tin bài viết
     */
    AdminPostDto updatePost(Long id, AdminPostDto postDto);
    
    /**
     * Khóa bài viết
     */
    AdminPostDto lockPost(Long id);
    
    /**
     * Mở khóa bài viết
     */
    AdminPostDto unlockPost(Long id);
} 