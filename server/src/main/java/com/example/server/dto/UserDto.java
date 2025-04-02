package com.example.server.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String fullName;
    private String location;
    private String website;
    private String email;
    private String birthDate;
    private String image;
    private String bio;
    private String backgroundImage;
    private String phone;
    private Boolean req_user;
    private Boolean login_with_Google;

    private List<UserDto> Followers = new ArrayList<>();
    private List<UserDto> following = new ArrayList<>();

    private boolean followed;

    private boolean isVarified;
}
