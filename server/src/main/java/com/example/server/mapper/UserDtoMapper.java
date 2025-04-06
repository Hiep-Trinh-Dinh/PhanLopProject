package com.example.server.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.example.server.dto.EducationDto;
import com.example.server.dto.UserDto;
import com.example.server.dto.WorkExperienceDto;
import com.example.server.models.Education;
import com.example.server.models.User;
import com.example.server.models.WorkExperience;

public class UserDtoMapper {
    public static UserDto toUserDto(User user) {
        if (user == null) return null;

        UserDto userDto = mapToUserDto(user);
        userDto.setFollowers(toUserDtos(user.getFollowers()));
        userDto.setFollowing(toUserDtos(user.getFollowing()));
        userDto.setLogin_with_Google(user.getLogin_with_Google());
        userDto.setPhone(user.getPhone());
        userDto.setEmail(user.getEmail());

        return userDto;
    }

    public static List<UserDto> toUserDtos(List<User> users) {
        if (users == null) return List.of();

        return users.stream()
                   .map(UserDtoMapper::mapToUserDto)
                   .collect(Collectors.toList());
    }

    private static List<WorkExperienceDto> mapWorkExperiences(List<WorkExperience> works) {
        if (works == null) return List.of();
        return works.stream()
            .map(w -> new WorkExperienceDto(
                w.getId(),
                w.getPosition(),
                w.getCompany(),
                w.isCurrent(),
                w.getStartYear(),
                w.getEndYear()))
            .collect(Collectors.toList());
    }

    private static List<EducationDto> mapEducations(List<Education> educations) {
        if (educations == null) return List.of();
        return educations.stream()
            .map(e -> new EducationDto(
                e.getId(),
                e.getSchool(),
                e.getDegree(),
                e.getIsCurrent(),
                e.getStartYear(),
                e.getEndYear()))
            .collect(Collectors.toList());
    }

    private static UserDto mapToUserDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        userDto.setLocation(user.getLocation());
        userDto.setWebsite(user.getWebsite());
        userDto.setBio(user.getBio());
        userDto.setImage(user.getImage());
        userDto.setBackgroundImage(user.getBackgroundImage());
        userDto.setBirthDate(user.getBirthDate());
        
        // Xử lý gender - chuyển từ enum sang giá trị frontend
        userDto.setGender(user.getGender() != null ? user.getGender().getFrontendValue() : null);
        
        userDto.setIsOnline(user.getIsOnline());
        userDto.setLastSeen(user.getLastSeen());
        userDto.setPostsCount(user.getPostsCount());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setIsRequestingUser(user.getIsRequestingUser());

        userDto.setCurrentCity(user.getCurrentCity());
        userDto.setHometown(user.getHometown());
        userDto.setRelationshipStatus(user.getRelationshipStatus());

        userDto.setWorkExperiences(mapWorkExperiences(user.getWorkExperiences()));
        userDto.setEducations(mapEducations(user.getEducations()));

        userDto.setPhone_contact(user.getPhone_contact());
        userDto.setEmail_contact(user.getEmail_contact());

        userDto.setUpdatedAt(user.getUpdatedAt());
        
        return userDto;
    }
}