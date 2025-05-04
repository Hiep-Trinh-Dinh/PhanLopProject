package com.example.server.dto;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.server.models.User;
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
    private Integer isOnline;
    private LocalDateTime lastSeen;
    private Integer postsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<UserDto> followers = new ArrayList<>(); 
    private List<UserDto> following = new ArrayList<>();
    private List<Long> friendIds = new ArrayList<>();

    private boolean followed;
    private boolean isVerified; // Sửa typo "isVarified"
    
    // Thêm các trường liên quan đến bạn bè
    private boolean isFriend;
    private boolean pendingFriendRequest;
    private boolean receivedFriendRequest;

    // Explicit setter for isFriend field
    public void setIsFriend(boolean isFriend) {
        this.isFriend = isFriend;
    }
    
    // Alias for isFriend to support setFriend() calls
    public void setFriend(boolean friend) {
        this.isFriend = friend;
    }

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
    
    /**
     * Creates a UserDto from a User entity
     * @param user The user entity to convert
     * @param includeDetails Whether to include detailed information like followers, following, etc.
     * @return The converted UserDto
     */
    public static UserDto fromEntity(User user, boolean includeDetails) {
        if (user == null) return null;
        
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setImage(user.getImage());
        dto.setUsername(user.getFirstName() + " " + user.getLastName());
        
        if (includeDetails) {
            dto.setLocation(user.getLocation());
            dto.setWebsite(user.getWebsite());
            dto.setEmail(user.getEmail());
            dto.setBirthDate(user.getBirthDate());
            dto.setBio(user.getBio());
            dto.setBackgroundImage(user.getBackgroundImage());
            dto.setPhone(user.getPhone());
            dto.setIsRequestingUser(user.getIsRequestingUser());
            dto.setLogin_with_Google(user.getLogin_with_Google());
            dto.setEmail_contact(user.getEmail_contact());
            dto.setPhone_contact(user.getPhone_contact());
            dto.setCurrentCity(user.getCurrentCity());
            dto.setHometown(user.getHometown());
            dto.setRelationshipStatus(user.getRelationshipStatus());
            dto.setGender(user.getGender() != null ? user.getGender().getFrontendValue() : null);
            dto.setIsOnline(user.isOnline());
            dto.setLastSeen(user.getLastSeen());
            dto.setPostsCount(user.getPostsCount());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setUpdatedAt(user.getUpdatedAt());
            dto.setVerified(user.getIsEmailVerified());
        }
        
        return dto;
    }
}