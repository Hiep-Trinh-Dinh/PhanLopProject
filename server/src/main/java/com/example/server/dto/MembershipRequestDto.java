package com.example.server.dto;

import lombok.Data;

@Data
public class MembershipRequestDto {
    private Long id;
    private GroupDto group;
    private UserDto user;
    private String status;
    private String createdAt;
}
