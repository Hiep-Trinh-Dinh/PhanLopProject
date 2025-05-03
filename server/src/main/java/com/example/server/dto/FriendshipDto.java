package com.example.server.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipDto implements Serializable {
    private Long id;
    private UserDto user;
    private UserDto friend;
    private String status; // "PENDING", "ACCEPTED", "REJECTED", "BLOCKED"
    private Integer mutualFriendsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 