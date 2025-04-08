package com.example.server.services.impl;

import com.example.server.dto.PostDto;
import com.example.server.mapper.PostDtoMapper;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.repositories.PostRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.LikeService;
import com.example.server.services.PostService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeService likeService;

    @Override
    public PostDto createPost(PostDto postDto, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = new Post();
        post.setContent(postDto.getContent());
        post.setUser(user);
        post.setPrivacy(Post.Privacy.valueOf(postDto.getPrivacy()));
        
        Post savedPost = postRepository.save(post);
        return PostDtoMapper.toPostDto(savedPost, user);
    }

    @Override
    public PostDto getPostById(Long postId, Long reqUserId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new RuntimeException("Requesting user not found"));
        
        return PostDtoMapper.toPostDtoWithDetails(post, reqUser);
    }

    @Override
    public List<PostDto> getAllPosts(Long reqUserId) {
        User reqUser = userRepository.findById(reqUserId)
            .orElseThrow(() -> new RuntimeException("Requesting user not found"));
        
        List<Post> posts = postRepository.findAll();
        return PostDtoMapper.toPostDtos(posts, reqUser);
    }

    @Override
    public PostDto updatePost(Long postId, PostDto postDto, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        User reqUser = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        post.setContent(postDto.getContent());
        post.setPrivacy(Post.Privacy.valueOf(postDto.getPrivacy()));
        
        Post updatedPost = postRepository.save(post);
        return PostDtoMapper.toPostDto(updatedPost, reqUser);
    }

    @Override
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        postRepository.delete(post);
    }

    @Override
    public PostDto repostPost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!post.getRepostUsers().contains(user)) {
            post.getRepostUsers().add(user);
            postRepository.save(post);
        }
        
        return PostDtoMapper.toPostDto(post, user);
    }

    @Override
    public PostDto likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        likeService.likePost(postId, userId); // Gọi LikeService
        
        return PostDtoMapper.toPostDto(post, user); // Trả về PostDto, không phải LikeDto
    }

    @Override
    public PostDto unlikePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        likeService.unlikePost(postId, userId); // Gọi LikeService
        
        return PostDtoMapper.toPostDto(post, user); // Trả về PostDto
    }
}