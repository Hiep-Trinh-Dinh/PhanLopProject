package com.example.server.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.example.server.models.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto implements Serializable {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String username; // firstName + lastName
    private String image;
    private String phone;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private Integer postsCount;
    private Integer friendsCount;
    private String status; // "active", "locked", "pending"
    private String role; // "user", "moderator", "admin" (sẽ được cài đặt sau)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastSeen;
    
    // Các thuộc tính dưới đây chỉ được sử dụng khi tạo user mới
    private String password;
    
    /**
     * Chuyển đổi từ User entity sang AdminUserDto
     */
    public static AdminUserDto fromEntity(User user) {
        if (user == null) return null;
        
        AdminUserDto dto = new AdminUserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getFirstName() + " " + user.getLastName());
        dto.setImage(user.getImage());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setIsEmailVerified(user.getIsEmailVerified());
        dto.setPostsCount(user.getPostsCount());
        dto.setFriendsCount(user.getFriends() != null ? user.getFriends().size() : 0);
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setLastSeen(user.getLastSeen());
        
        // Xác định status dựa vào isActive
        if (Boolean.TRUE.equals(user.getIsActive())) {
            dto.setStatus("active");
        } else {
            dto.setStatus("locked");
        }
        
        // TODO: Xác định role dựa vào logic phân quyền (tạm thời để là user)
        dto.setRole("user");
        
        // Email admin mặc định được gán quyền admin - chỉ đuôi @admin.com và admin@phanlop.com
        if (user.getEmail() != null) {
            boolean isAdminEmail = user.getEmail().endsWith("@admin.com") || 
                               user.getEmail().equals("admin@phanlop.com");
            
            if (isAdminEmail) {
                dto.setRole("admin");
            }
        }
        
        return dto;
    }
} 