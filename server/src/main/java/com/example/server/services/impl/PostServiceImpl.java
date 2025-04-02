package com.example.server.services.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.server.exception.PostException;
import com.example.server.exception.UserException;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.repositories.PostRepository;
import com.example.server.requests.PostReplyRequest;
import com.example.server.services.PostService;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Override
    public Post createPost(Post req, User user) throws UserException {
        Post post = new Post();
        post.setContent(req.getContent());
        post.setCreatedAt(req.getCreatedAt());
        post.setImage(req.getImage());
        post.setUser(user);
        post.setIsReply(false);
        post.setIsPost(true);
        post.setVideo(req.getVideo());

        return postRepository.save(post);
    }

    @Override
    public List<Post> findAllPosts() {
        return postRepository.findAllByIsPostTrueOrderByCreatedAtDesc();
    }

    @Override
    public Post rePost(Long postId, User user) throws UserException, PostException {
        Post post = findById(postId);
        if(post.getRepostUsers().contains(user)){
            post.getRepostUsers().remove(user);
        } else {
            post.getRepostUsers().add(user);
        }

        return postRepository.save(post);
    }

    @Override
    public Post findById(Long postId) throws PostException {
        return postRepository.findById(postId).orElseThrow(() ->
            new PostException("Không tìm thấy bài viết với id: " + postId)
        );
    }

    @Override
    public void deletePostById(Long postId, Long userId) throws PostException, UserException {
        Post post = findById(postId);
        if(!post.getUser().getId().equals(userId)){
            throw new UserException("Không thể xóa bài viết của người khác");
        }

        postRepository.deleteById(post.getId());
    }

    @Override
    public Post removeFromRepost(Long postId, User user) throws PostException, UserException {
        throw new UnsupportedOperationException("Unimplemented method 'removeFromRepost'");
    }

    @Override
    public Post createReply(PostReplyRequest req, User user) throws PostException {
        Post replyFor = findById(req.getPostId());

        Post post = new Post();
        post.setContent(req.getContent());
        post.setCreatedAt(req.getCreatedAt());
        post.setImage(req.getImage());
        post.setUser(user);
        post.setIsReply(true);
        post.setIsPost(false);
        post.setReplyFor(replyFor);

        Post savedPost = postRepository.save(post);
        replyFor.getReplyPosts().add(savedPost);
        postRepository.save(replyFor);  

        return replyFor;
    }

    @Override
    public List<Post> getUserPosts(User user) {
        return postRepository.findByRepostUsersContainingOrUser_IdAndIsPostTrueOrderByCreatedAtDesc(user, user.getId());
    }

    @Override
    public List<Post> getByLikesContainsUser(User user) {
        return postRepository.findByLikesUserId(user.getId());
    }
}
