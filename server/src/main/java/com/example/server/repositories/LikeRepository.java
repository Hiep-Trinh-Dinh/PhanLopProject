package com.example.server.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.server.models.Like;

public interface LikeRepository extends JpaRepository<Like, Long> {

    @Query("SELECT l FROM Like l WHERE l.user.id = :userId AND l.post.id = :postId")
    public Like isLikeExist(@Param("userId") Long userId, @Param("postId") Long postId);

    @Query("SELECT l FROM Like l WHERE l.post.id = :postId")
    public List<Like> findByPostId(@Param("postId") Long postId);

    List<Like> findByCommentId(Long commentId);
    void deleteByPostIdAndUserId(Long postId, Long userId);
    void deleteByCommentIdAndUserId(Long commentId, Long userId);

    public Optional<Like> findByPostIdAndUserId(Long postId, Long userId);

    public Optional<Like> findByCommentIdAndUserId(Long commentId, Long userId);
}