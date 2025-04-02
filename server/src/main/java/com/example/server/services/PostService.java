package com.example.server.services;

import java.util.List;

import com.example.server.exception.PostException;
import com.example.server.exception.UserException;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.requests.PostReplyRequest;

public interface PostService {
    
    public Post createPost(Post req, User user) throws UserException;
    public List<Post> findAllPosts();
    public Post rePost(Long postId, User user) throws UserException, PostException;
    public Post findById(Long postId) throws PostException;

    public void deletePostById(Long postId, Long userId) throws PostException, UserException;

    public Post removeFromRepost(Long postId, User user) throws PostException, UserException;

    public Post createReply(PostReplyRequest req, User user) throws PostException;

    public List<Post> getUserPosts(User user);

    public List<Post> getByLikesContainsUser(User user);
}
