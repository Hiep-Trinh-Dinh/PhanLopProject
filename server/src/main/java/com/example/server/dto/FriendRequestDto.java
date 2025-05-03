package com.example.server.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestDto implements Serializable {
    private Long id;
    private UserDto sender;
    private UserDto receiver;
    private String status; // "PENDING", "ACCEPTED", "REJECTED"
    private LocalDateTime createdAt;
    private Integer mutualFriendsCount;
} 