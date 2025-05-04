package com.example.server.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GroupMemberDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private UserDto user;
    private String role;
    private LocalDateTime joinedAt;
}