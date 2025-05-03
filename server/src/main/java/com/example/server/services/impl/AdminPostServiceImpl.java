package com.example.server.services.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.server.dto.AdminPostDto;
import com.example.server.models.Post;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.repositories.PostRepository;
import com.example.server.services.AdminPostService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AdminPostServiceImpl implements AdminPostService {

    @Autowired
    private PostRepository postRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public Page<AdminPostDto> getAllPosts(Pageable pageable, String query, String status) {
        log.info("Fetching all posts with query: {}, status: {}", query, status);
        
        Page<Post> posts;
        
        if (query != null && !query.trim().isEmpty()) {
            // Có tìm kiếm
            if (status.equalsIgnoreCase("active")) {
                posts = postRepository.searchActivePosts(query, pageable);
            } else if (status.equalsIgnoreCase("inactive")) {
                posts = postRepository.searchInactivePosts(query, pageable);
            } else {
                // status = all
                posts = postRepository.searchAllPosts(query, pageable);
            }
        } else {
            // Không có tìm kiếm
            if (status.equalsIgnoreCase("active")) {
                posts = postRepository.findByIsActiveTrue(pageable);
            } else if (status.equalsIgnoreCase("inactive")) {
                posts = postRepository.findByIsActiveFalse(pageable);
            } else {
                // status = all
                posts = postRepository.findAll(pageable);
            }
        }
        
        return posts.map(post -> convertToAdminPostDto(post));
    }

    @Override
    public AdminPostDto getPostById(Long postId) {
        log.info("Fetching post with id: {}", postId);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        
        return convertToAdminPostDto(post);
    }

    @Override
    public AdminPostDto updatePost(Long postId, AdminPostDto postDto) {
        log.info("Updating post with id: {}", postId);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        
        // Update post fields
        post.setContent(postDto.getContent());
        post.setPrivacy(Post.Privacy.valueOf(postDto.getPrivacy()));
        
        Post savedPost = postRepository.save(post);
        
        return convertToAdminPostDto(savedPost);
    }

    @Override
    public AdminPostDto lockPost(Long postId) {
        log.info("Locking post with id: {}", postId);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        
        post.setIsActive(false);
        Post savedPost = postRepository.save(post);
        
        return convertToAdminPostDto(savedPost);
    }

    @Override
    public AdminPostDto unlockPost(Long postId) {
        log.info("Unlocking post with id: {}", postId);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        
        post.setIsActive(true);
        Post savedPost = postRepository.save(post);
        
        return convertToAdminPostDto(savedPost);
    }
    
    // Phương thức chuyển đổi từ Post entity sang AdminPostDto
    private AdminPostDto convertToAdminPostDto(Post post) {
        if (post == null) return null;
        
        return AdminPostDto.fromEntity(post);
    }
} 