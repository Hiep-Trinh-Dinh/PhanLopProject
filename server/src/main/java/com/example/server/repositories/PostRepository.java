package com.example.server.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.server.models.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByPrivacy(Post.Privacy privacy, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.privacy = :privacy OR p.user.id = :userId")
    Page<Post> findByPrivacyOrUserId(@Param("privacy") Post.Privacy privacy, @Param("userId") Long userId, Pageable pageable);
}
