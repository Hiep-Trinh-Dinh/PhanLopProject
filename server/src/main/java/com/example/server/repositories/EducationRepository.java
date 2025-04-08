package com.example.server.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.server.models.Education;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
}
