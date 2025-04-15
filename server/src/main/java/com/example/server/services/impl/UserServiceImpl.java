package com.example.server.services.impl;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.server.config.JwtProvider;
import com.example.server.dto.EducationDto;
import com.example.server.dto.UserDto;
import com.example.server.dto.WorkExperienceDto;
import com.example.server.exception.UserException;
import com.example.server.models.Education;
import com.example.server.models.FriendRequest;
import com.example.server.models.User;
import com.example.server.models.WorkExperience;
import com.example.server.repositories.FriendRequestRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Override
    @Cacheable(value = "users", key = "#userId")
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
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;
    }

    @Transactional
    @CacheEvict(value = "users", key = "#userId")
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
        Optional.ofNullable(dto.getPhone()).ifPresent(user::setPhone);
        
        // Xử lý Educations
        if (dto.getEducations() != null) {
            Map<Long, Education> existingEducations = user.getEducations().stream()
                    .collect(Collectors.toMap(Education::getId, edu -> edu));

            List<Long> dtoEducationIds = dto.getEducations().stream()
                    .filter(eduDto -> eduDto.getId() != null)
                    .map(EducationDto::getId)
                    .toList();

            user.getEducations().removeIf(edu -> !dtoEducationIds.contains(edu.getId()));

            for (EducationDto eduDto : dto.getEducations()) {
                Education education;
                if (eduDto.getId() != null && existingEducations.containsKey(eduDto.getId())) {
                    education = existingEducations.get(eduDto.getId());
                    education.setSchool(eduDto.getSchool());
                    education.setDegree(eduDto.getDegree());
                    education.setIsCurrent(Boolean.TRUE.equals(eduDto.getIsCurrent()));
                    education.setStartYear(eduDto.getStartYear());
                    education.setEndYear(eduDto.getEndYear());
                } else {
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
            Map<Long, WorkExperience> existingWorks = user.getWorkExperiences().stream()
                    .collect(Collectors.toMap(WorkExperience::getId, work -> work));

            List<Long> dtoWorkIds = dto.getWorkExperiences().stream()
                    .filter(workDto -> workDto.getId() != null)
                    .map(WorkExperienceDto::getId)
                    .toList();

            user.getWorkExperiences().removeIf(work -> !dtoWorkIds.contains(work.getId()));

            for (WorkExperienceDto workDto : dto.getWorkExperiences()) {
                WorkExperience work;
                if (workDto.getId() != null && existingWorks.containsKey(workDto.getId())) {
                    work = existingWorks.get(workDto.getId());
                    work.setPosition(workDto.getPosition());
                    work.setCompany(workDto.getCompany());
                    work.setCurrent(Boolean.TRUE.equals(workDto.isCurrent()));
                    work.setStartYear(workDto.getStartYear());
                    work.setEndYear(workDto.getEndYear());
                } else {
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

    @Transactional
    @CacheEvict(value = "users", allEntries = true) // Xóa toàn bộ cache vì ảnh hưởng đến nhiều user
    @Override
    public User followUser(Long userId, User user) throws UserException {
        User followUser = findUserById(userId);
        if (user.getFollowing().contains(followUser) && followUser.getFollowers().contains(user)) {
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
    public Page<User> searchUser(String query, Pageable pageable) {
        return userRepository.findByNameOrEmailContainingIgnoreCase(
                query, pageable);
    }

    @Transactional
    @Override
    public FriendRequest sendFriendRequest(Long receiverId, User sender) throws UserException {
        if (sender.getId().equals(receiverId)) {
            throw new UserException("Cannot send friend request to yourself");
        }

        User receiver = findUserById(receiverId);

        // Kiểm tra xem đã là bạn bè chưa
        if (sender.getFriends().contains(receiver)) {
            throw new UserException("Already friends with this user");
        }

        // Kiểm tra yêu cầu hiện có
        FriendRequest existingRequest = friendRequestRepository.findBySenderAndReceiver(sender, receiver);
        if (existingRequest != null && existingRequest.getStatus() == FriendRequest.Status.PENDING) {
            throw new UserException("Friend request already sent");
        }

        FriendRequest request = new FriendRequest(sender, receiver);
        return friendRequestRepository.save(request);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    @Override
    public FriendRequest acceptFriendRequest(Long requestId, User receiver) throws UserException {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new UserException("Friend request not found"));

        if (!request.getReceiver().equals(receiver)) {
            throw new UserException("You are not authorized to accept this request");
        }

        if (request.getStatus() != FriendRequest.Status.PENDING) {
            throw new UserException("Request is not pending");
        }

        request.setStatus(FriendRequest.Status.ACCEPTED);

        // Thêm vào danh sách bạn bè của cả hai
        User sender = request.getSender();
        sender.getFriends().add(receiver);
        receiver.getFriends().add(sender);

        userRepository.save(sender);
        userRepository.save(receiver);
        return friendRequestRepository.save(request);
    }

    @Transactional
    @Override
    public void rejectFriendRequest(Long requestId, User receiver) throws UserException {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new UserException("Friend request not found"));

        if (!request.getReceiver().equals(receiver)) {
            throw new UserException("You are not authorized to reject this request");
        }

        friendRequestRepository.delete(request);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    @Override
    public void removeFriend(Long friendId, User user) throws UserException {
        User friend = findUserById(friendId);

        if (!user.getFriends().contains(friend)) {
            throw new UserException("Not friends with this user");
        }

        user.getFriends().remove(friend);
        friend.getFriends().remove(user);

        userRepository.save(user);
        userRepository.save(friend);
    }

    @Override
    public List<FriendRequest> getPendingFriendRequests(User user) {
        return friendRequestRepository.findByReceiverAndStatus(user, FriendRequest.Status.PENDING);
    }
}