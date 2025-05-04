package com.example.server.dto;

import java.io.Serializable;

import lombok.Data;

@Data
public class GroupDto implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String name;
    private String description;
    private String avatar;
    private String cover;
    private String privacy;
    private Integer memberCount;
    private Integer postCount;
    private Integer mediaCount;
    private String rules;
    private Long createdById;
    private Boolean isAdmin;
    private Boolean isMember;
}