package com.example.server.dto;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.server.models.User.Gender;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto implements Serializable{
    private Long id;
    private String firstName;
    private String lastName;
    private String location;
    private String website;
    private String email;
    private String birthDate;
    private String image;
    private String bio;
    private String backgroundImage;
    private String phone;
    private Boolean isRequestingUser;
    private Boolean login_with_Google;

    private String username;

    private String email_contact;
    private String phone_contact;

    private String currentCity;
    private String hometown;
    private String relationshipStatus;
    
    private List<WorkExperienceDto> workExperiences = new ArrayList<>();
    private List<EducationDto> educations = new ArrayList<>();
    
    private String gender;
    private Boolean isOnline;
    private LocalDateTime lastSeen;
    private Integer postsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<UserDto> followers = new ArrayList<>(); 
    private List<UserDto> following = new ArrayList<>();
    private List<Long> friendIds = new ArrayList<>();

    private boolean followed;
    private boolean isVerified; // Sửa typo "isVarified"

    public Gender getGenderEnum() {
        return gender != null ? Gender.fromFrontendValue(gender) : null;
    }

    public UserDto(Long id, String firstName, String lastName, String username, String image) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.image = image;
    }
}