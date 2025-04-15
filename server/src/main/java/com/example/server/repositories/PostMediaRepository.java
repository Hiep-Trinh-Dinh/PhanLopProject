package com.example.server.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.server.models.PostMedia;

@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    
}
