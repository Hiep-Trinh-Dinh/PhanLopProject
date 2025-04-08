package com.example.server.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.server.models.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
}
