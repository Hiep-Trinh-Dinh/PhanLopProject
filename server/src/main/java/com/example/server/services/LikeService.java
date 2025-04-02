package com.example.server.services;

import java.util.List;

import com.example.server.exception.PostException;
import com.example.server.exception.UserException;
import com.example.server.models.Like;
import com.example.server.models.User;

public interface LikeService {
    
    public Like likePost(User user, Long twitId) throws UserException, PostException;

    public List<Like> getAllLikes(Long twitId) throws PostException;
}