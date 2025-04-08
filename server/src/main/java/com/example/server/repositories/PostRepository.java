package com.example.server.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.server.models.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
}
