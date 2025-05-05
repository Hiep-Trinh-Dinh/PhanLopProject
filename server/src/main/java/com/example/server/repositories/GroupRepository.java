package com.example.server.repositories;

import com.example.server.models.Group;
import com.example.server.models.Group.Privacy;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupRepository extends JpaRepository<Group, Long> {
    Page<Group> findByPrivacy(Group.Privacy privacy, Pageable pageable);

    @Query("SELECT g FROM Group g JOIN g.members m WHERE m.user.id = :userId")
    Page<Group> findByMemberId(Long userId, Pageable pageable);

    Page<Group> findByPrivacyOrMembers_Id(Privacy public1, Long userId, Pageable pageable);

    Page<Group> findByMembers_Id(Long userId, Pageable pageable);

    @Query("SELECT g FROM Group g WHERE :userId IS NULL OR EXISTS (SELECT m FROM g.members m WHERE m.id = :userId)")
    Page<Group> findByMembers_IdOrAll(@Param("userId") Long userId, Pageable pageable);
}