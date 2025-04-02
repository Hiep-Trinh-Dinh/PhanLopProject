package com.example.server.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thông tin cơ bản
    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    // Thông tin cá nhân
    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    // Thông tin profile
    private String avatar;
    private String cover;
    private String bio;
    private String location;
    private String phone;

    // Trạng thái tài khoản
    @Column(name = "is_online")
    private Boolean isOnline = false;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Thông tin xác thực
    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_expires")
    private LocalDateTime resetPasswordExpires;

    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = false;

    // Thông tin cá nhân
    @Column(name = "relationship_status")
    @Enumerated(EnumType.STRING)
    private RelationshipStatus relationshipStatus;

    @Column(name = "hometown")
    private String hometown;

    @Column(name = "work_place")
    private String workPlace;

    @Column(name = "education")
    private String education;

    // Thống kê
    @Column(name = "following_count")
    private Integer followingCount = 0;

    @Column(name = "followers_count")
    private Integer followersCount = 0;

    @Column(name = "posts_count")
    private Integer postsCount = 0;

    // Timestamps
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum RelationshipStatus {
        SINGLE, IN_RELATIONSHIP, MARRIED, COMPLICATED
    }

    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 