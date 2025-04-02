package com.example.server.services.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.server.exception.PostException;
import com.example.server.exception.UserException;
import com.example.server.models.Like;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.repositories.LikeRepository;
import com.example.server.repositories.PostRepository;
import com.example.server.services.LikeService;
import com.example.server.services.PostService;

@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostService postService;

    @Override
    public Like likePost(User user, Long postId) throws UserException, PostException {
        Like isLikeExist = likeRepository.isLikeExist(user.getId(), postId);

        if (isLikeExist != null) {
            likeRepository.deleteById(isLikeExist.getId());
            return isLikeExist;
        }

        Post post = postService.findById(postId);

        Like like = new Like();
        like.setUser(user);
        like.setPost(post);

        Like savedLike = likeRepository.save(like);

        post.getLikes().add(savedLike);
        postRepository.save(post);

        return savedLike;
    }

    @Override
    public List<Like> getAllLikes(Long postId) throws PostException {
        Post post = postService.findById(postId);
        return likeRepository.findByPostId(post.getId());
    }
}
