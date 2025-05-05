package com.example.server.repositories;

import com.example.server.models.MembershipRequest;
import com.example.server.models.MembershipRequest.Status;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembershipRequestRepository extends JpaRepository<MembershipRequest, Long> {
    Optional<MembershipRequest> findByGroupIdAndUserId(Long groupId, Long userId);
    List<MembershipRequest> findByGroupIdAndStatus(Long groupId, MembershipRequest.Status status);
    Page<MembershipRequest> findByGroupIdAndStatus(Long groupId, Status pending, Pageable pageable);
    boolean existsByGroupIdAndUserIdAndStatus(Long groupId, Long userId, Status pending);
    Page<MembershipRequest> findByUserId(Long userId, Pageable pageable);
}