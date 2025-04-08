package com.example.server.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.server.models.Post;
import com.example.server.models.User;

public interface PostRepository extends JpaRepository<Post, Long> {
    
    List<Post> findAllByIsPostTrueOrderByCreatedAtDesc();

    List<Post> findByRepostUsersContainingOrUser_IdAndIsPostTrueOrderByCreatedAtDesc(User user, Long userId);

    List<Post> findByLikesContainingOrderByCreatedAtDesc(User user);    

    @Query("SELECT p FROM Post p JOIN p.likes l WHERE l.user.id = :userId")
    List<Post> findByLikesUserId(Long userId);
}
