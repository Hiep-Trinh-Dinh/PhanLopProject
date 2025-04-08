package com.example.server.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.server.config.JwtProvider;
import com.example.server.dto.EducationDto;
import com.example.server.dto.UserDto;
import com.example.server.dto.WorkExperienceDto;
import com.example.server.exception.UserException;
import com.example.server.models.Education;
import com.example.server.models.User;
import com.example.server.models.WorkExperience;
import com.example.server.repositories.UserRepository;
import com.example.server.services.UserService;

import jakarta.transaction.Transactional;

@Service
public class UserServiceImpl implements UserService{

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    @Override
    public User findUserById(Long userId) throws UserException {
        if (userId == null) {
            throw new UserException("User ID cannot be null");
        }
    
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found");
        }
        
        return user;
    }    

    @Override
    public User findUserProfileByJwt(String jwt) throws UserException {
        String email = jwtProvider.getEmailFromToken(jwt);

        User user = userRepository.findByEmail(email);
        if(user == null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;
    }

    @Transactional // Đảm bảo tất cả thay đổi được commit
    @Override
    public User updateUser(Long userId, UserDto dto) throws UserException {
        User user = findUserById(userId);
    
        // Cập nhật các field cơ bản
        Optional.ofNullable(dto.getFirstName()).ifPresent(user::setFirstName);
        Optional.ofNullable(dto.getLastName()).ifPresent(user::setLastName);
        Optional.ofNullable(dto.getImage()).ifPresent(user::setImage);
        Optional.ofNullable(dto.getBackgroundImage()).ifPresent(user::setBackgroundImage);
        Optional.ofNullable(dto.getBirthDate()).ifPresent(user::setBirthDate);
        Optional.ofNullable(dto.getLocation()).ifPresent(user::setLocation);
        Optional.ofNullable(dto.getBio()).ifPresent(user::setBio);
        Optional.ofNullable(dto.getWebsite()).ifPresent(user::setWebsite);
        Optional.ofNullable(dto.getEmail_contact()).ifPresent(user::setEmail_contact);
        Optional.ofNullable(dto.getPhone_contact()).ifPresent(user::setPhone_contact);
        Optional.ofNullable(dto.getRelationshipStatus()).ifPresent(user::setRelationshipStatus);
        Optional.ofNullable(dto.getCurrentCity()).ifPresent(user::setCurrentCity);
        Optional.ofNullable(dto.getHometown()).ifPresent(user::setHometown);
        Optional.ofNullable(LocalDateTime.now()).ifPresent(user::setUpdatedAt);
    
        // Xử lý Educations
        if (dto.getEducations() != null) {
            // Tạo map của educations hiện tại
            Map<Long, Education> existingEducations = user.getEducations().stream()
                .collect(Collectors.toMap(Education::getId, edu -> edu));
    
            // Xác định các education cần xóa
            List<Long> dtoEducationIds = dto.getEducations().stream()
                .filter(eduDto -> eduDto.getId() != null)
                .map(EducationDto::getId)
                .toList();
    
            user.getEducations().removeIf(edu -> !dtoEducationIds.contains(edu.getId()));
    
            // Cập nhật hoặc thêm mới
            for (EducationDto eduDto : dto.getEducations()) {
                Education education;
                if (eduDto.getId() != null && existingEducations.containsKey(eduDto.getId())) {
                    // Update education cũ
                    education = existingEducations.get(eduDto.getId());
                    education.setSchool(eduDto.getSchool());
                    education.setDegree(eduDto.getDegree());
                    education.setIsCurrent(Boolean.TRUE.equals(eduDto.getIsCurrent()));
                    education.setStartYear(eduDto.getStartYear());
                    education.setEndYear(eduDto.getEndYear());
                } else {
                    // Tạo education mới
                    education = new Education();
                    education.setSchool(eduDto.getSchool());
                    education.setDegree(eduDto.getDegree());
                    education.setStartYear(eduDto.getStartYear());
                    education.setIsCurrent(Boolean.TRUE.equals(eduDto.getIsCurrent()));
                    education.setEndYear(eduDto.getEndYear());
                    education.setUser(user);
                    user.getEducations().add(education);
                }
            }
        }
    
        // Xử lý WorkExperiences
        if (dto.getWorkExperiences() != null) {
            // Tạo map của work experiences hiện tại
            Map<Long, WorkExperience> existingWorks = user.getWorkExperiences().stream()
                .collect(Collectors.toMap(WorkExperience::getId, work -> work));
    
            // Xác định các work experience cần xóa
            List<Long> dtoWorkIds = dto.getWorkExperiences().stream()
                .filter(workDto -> workDto.getId() != null)
                .map(WorkExperienceDto::getId)
                .toList();
    
            user.getWorkExperiences().removeIf(work -> !dtoWorkIds.contains(work.getId()));
    
            // Cập nhật hoặc thêm mới
            for (WorkExperienceDto workDto : dto.getWorkExperiences()) {
                WorkExperience work;
                if (workDto.getId() != null && existingWorks.containsKey(workDto.getId())) {
                    // Update work experience cũ
                    work = existingWorks.get(workDto.getId());
                    work.setPosition(workDto.getPosition());
                    work.setCompany(workDto.getCompany());
                    work.setCurrent(Boolean.TRUE.equals(workDto.isCurrent()));
                    work.setStartYear(workDto.getStartYear());
                    work.setEndYear(workDto.getEndYear());
                } else {
                    // Tạo work experience mới
                    work = new WorkExperience();
                    work.setPosition(workDto.getPosition());
                    work.setCompany(workDto.getCompany());
                    work.setCurrent(Boolean.TRUE.equals(workDto.isCurrent()));
                    work.setStartYear(workDto.getStartYear());
                    work.setEndYear(workDto.getEndYear());
                    work.setUser(user);
                    user.getWorkExperiences().add(work);
                }
            }
        }
    
        return userRepository.save(user);
    }
    
    @Override
    public User followUser(Long userId, User user) throws UserException {
        User followUser = findUserById(user.getId());
        if(user.getFollowing().contains(followUser)&& followUser.getFollowers().contains(user)){
            user.getFollowing().remove(followUser);
            followUser.getFollowers().remove(user);
        } else {
            user.getFollowing().add(followUser);
            followUser.getFollowers().add(user);
        }
        userRepository.save(user);
        userRepository.save(followUser);

        return followUser;
    }

    @Override
    public List<User> seacrhUser(String query) {
        return userRepository.searchUser(query);
    }
    
}
