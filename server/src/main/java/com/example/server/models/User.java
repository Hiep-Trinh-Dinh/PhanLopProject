package com.example.server.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.OneToOne;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String location;
    private String website;
    private String phone;
    private String email;
    private String birthDate;

    @JsonIgnore
    private String password;
    
    private String image;
    private String bio;
    private String backgroundImage;

    private String email_contact;
    private String phone_contact;

    private Boolean isRequestingUser = false;
    private Boolean login_with_Google = false;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "is_online", nullable = false)
    private int isOnline = 0;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_expires")
    private LocalDateTime resetPasswordExpires;

    @Column(name = "posts_count")
    private Integer postsCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Gender {
        MALE("male"),
        FEMALE("female"), 
        OTHER("custom");

        private final String frontendValue;

        Gender(String frontendValue) {
            this.frontendValue = frontendValue;
        }

        public String getFrontendValue() {
            return frontendValue;
        }

        public static Gender fromFrontendValue(String value) {
            for (Gender gender : values()) {
                if (gender.frontendValue.equalsIgnoreCase(value)) {
                    return gender;
                }
            }
            throw new IllegalArgumentException("Invalid gender value: " + value);
        }
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

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Like> likes = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    private Verification verification;

    @ManyToMany
    @JoinTable(
        name = "user_followers",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    private List<User> followers = new ArrayList<>();

    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "user_following",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    private List<User> following = new ArrayList<>();

    // Danh sách bạn bè (friends)
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "user_friends",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "friend_id")
    )
    private List<User> friends = new ArrayList<>();

    // Work & Education
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkExperience> workExperiences = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educations = new ArrayList<>();

    private String currentCity;
    private String hometown;
    private String relationshipStatus;

    public int isOnline() {
        return isOnline;
    }
    
    public void setOnline(int online) {
        isOnline = online;
    }
    
    /**
     * Kiểm tra xem người dùng có phải là admin không dựa trên email
     * @return true nếu là admin, false nếu không phải
     */
    public boolean isAdmin() {
        if (email != null) {
            // Kiểm tra chính xác đuôi email - KHÔNG phải @gmail.com
            return email.endsWith("@admin.com") || email.equals("admin@phanlop.com");
        }
        return false;
    }
    
    /**
     * Lấy tên đăng nhập của người dùng (dùng email hoặc kết hợp firstName và lastName)
     * @return username của người dùng
     */
    public String getUsername() {
        if (email != null) {
            return email;
        }
        
        // Nếu không có email, dùng firstName và lastName để tạo username
        StringBuilder username = new StringBuilder();
        if (firstName != null) {
            username.append(firstName);
        }
        if (lastName != null) {
            if (username.length() > 0) {
                username.append(" ");
            }
            username.append(lastName);
        }
        
        // Nếu không có thông tin nào, trả về "unknown"
        if (username.length() == 0) {
            return "unknown";
        }
        
        return username.toString();
    }
}