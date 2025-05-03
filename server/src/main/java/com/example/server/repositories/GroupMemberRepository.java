package com.example.server.repositories;

import com.example.server.models.GroupMember;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId AND gm.role IN ('ADMIN', 'MODERATOR')")
    Optional<GroupMember> findAdminOrModerator(Long groupId, Long userId);

    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    Page<GroupMember> findByGroupId(Long groupId, Pageable pageable);

    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND " +
    "(LOWER(gm.user.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
    "LOWER(gm.user.lastName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<GroupMember> findByGroupIdAndUserFirstOrLastNameContaining(
    @Param("groupId") Long groupId, 
    @Param("query") String query, 
    Pageable pageable);
}