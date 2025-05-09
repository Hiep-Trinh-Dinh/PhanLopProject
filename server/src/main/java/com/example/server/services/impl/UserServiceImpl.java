package com.example.server.services.impl;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import com.example.server.repositories.FriendshipRepository;
import com.example.server.models.Friendship;
import com.example.server.requests.UserRequest;
import com.example.server.services.UserService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public User findByEmail(String email) throws UserException {
        if (email == null || email.isBlank()) {
            throw new UserException("Email cannot be null or empty");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;
    }

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
        // Tiền xử lý query
        String trimmedQuery = query.trim();
        
        // Phân tách query thành các từ
        String[] words = trimmedQuery.split("\\s+");
        
        // Lấy từ đầu tiên và từ thứ hai (nếu có)
        String firstWord = words.length > 0 ? words[0] : null;
        String secondWord = words.length > 1 ? words[1] : null;
        
        // Log thông tin tìm kiếm
        System.out.println("Search query: '" + trimmedQuery + "', First word: '" + 
                           firstWord + "', Second word: '" + secondWord + "'");
        
        // Gọi repository với đầy đủ thông tin
        return userRepository.searchUserAdvanced(trimmedQuery, firstWord, secondWord, pageable);
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
    @CacheEvict(value = {"users", "friendships", "friendrequests"}, allEntries = true)
    @Override
    public void removeFriend(Long friendId, User user) throws UserException {
        User friend = findUserById(friendId);

        if (!user.getFriends().contains(friend)) {
            throw new UserException("Not friends with this user");
        }

        try {
            System.out.println("===== BẮT ĐẦU XÓA BẠN BÈ ===== User: " + user.getId() + ", Friend: " + friendId);
            
            // BƯỚC 1: Kiểm tra mối quan hệ bạn bè trong cả hai bảng
            int userFriendsCount = friendshipRepository.countUserFriendsRelation(user.getId(), friendId);
            var friendship1 = friendshipRepository.findByUserAndFriend(user, friend);
            var friendship2 = friendshipRepository.findByUserAndFriend(friend, user);
            
            boolean hasFriendship1 = friendship1.isPresent() && friendship1.get().getStatus() == Friendship.FriendshipStatus.ACCEPTED;
            boolean hasFriendship2 = friendship2.isPresent() && friendship2.get().getStatus() == Friendship.FriendshipStatus.ACCEPTED;
            
            System.out.println("Kiểm tra: user_friends count = " + userFriendsCount + 
                             ", friendship1 exists = " + hasFriendship1 + 
                             ", friendship2 exists = " + hasFriendship2);
            
            // BƯỚC 2: Xóa từ bảng Friendship
            if (friendship1.isPresent()) {
                friendshipRepository.delete(friendship1.get());
                System.out.println("Đã xóa friendship từ User -> Friend");
            }
            
            if (friendship2.isPresent()) {
                friendshipRepository.delete(friendship2.get());
                System.out.println("Đã xóa friendship từ Friend -> User");
            }
            
            // BƯỚC 3: Xóa trực tiếp từ bảng user_friends
            directRemoveFriendConnection(user.getId(), friendId);
            
            // BƯỚC 4: Dùng phương thức cleanup để đảm bảo dữ liệu đã được xóa
            int cleanedUp = friendshipRepository.cleanupInvalidUserFriends(user.getId(), friendId);
            System.out.println("Cleanup: Đã xóa thêm " + cleanedUp + " quan hệ không hợp lệ");
            
            // BƯỚC 5: Xóa từ danh sách bạn bè trong entities và lưu lại
            // Refresh entities để đảm bảo chúng ta có dữ liệu mới nhất
            entityManager.clear(); // Clear để đảm bảo lấy dữ liệu mới từ database
            
            User refreshedUser = findUserById(user.getId());
            User refreshedFriend = findUserById(friendId);
            
            boolean removed1 = refreshedUser.getFriends().remove(refreshedFriend);
            boolean removed2 = refreshedFriend.getFriends().remove(refreshedUser);
            System.out.println("Xóa từ collection: User->Friend: " + removed1 + ", Friend->User: " + removed2);
            
            userRepository.save(refreshedUser);
            userRepository.save(refreshedFriend);
            userRepository.flush();
            
            System.out.println("===== HOÀN THÀNH XÓA BẠN BÈ =====");
        } catch (Exception e) {
            System.err.println("Lỗi khi xóa bạn bè: " + e.getMessage());
            e.printStackTrace();
            throw new UserException("Lỗi khi xóa bạn bè: " + e.getMessage());
        }
    }

    @Override
    public List<FriendRequest> getPendingFriendRequests(User user) {
        return friendRequestRepository.findByReceiverAndStatus(user, FriendRequest.Status.PENDING);
    }

    @Override
    @Cacheable(value = "friendships", key = "'friendship_' + #userId1 + '_' + #userId2")
    public boolean isFriend(Long userId1, Long userId2) throws UserException {
        // Nếu ID giống nhau, không thể là bạn bè
        if (userId1.equals(userId2)) {
            return false;
        }
        
        User user1 = findUserById(userId1);
        User user2 = findUserById(userId2);
        
        // Kiểm tra xem user1 có trong danh sách bạn bè của user2 không (và ngược lại)
        return user1.getFriends().contains(user2) && user2.getFriends().contains(user1);
    }
    
    @Override
    @Cacheable(value = "friendrequests", key = "'pending_' + #userId1 + '_' + #userId2")
    public boolean hasPendingFriendRequest(Long userId1, Long userId2) throws UserException {
        // Nếu ID giống nhau, không thể có lời mời kết bạn
        if (userId1.equals(userId2)) {
            return false;
        }
        
        User sender = findUserById(userId1);
        User receiver = findUserById(userId2);
        
        // Kiểm tra xem có lời mời kết bạn đang chờ xử lý từ userId1 đến userId2 không
        FriendRequest request = friendRequestRepository.findBySenderAndReceiver(sender, receiver);
        return request != null && request.getStatus() == FriendRequest.Status.PENDING;
    }

    // Phương thức xóa bạn bè trực tiếp từ bảng user_friends
    private void directRemoveFriendConnection(Long userId, Long friendId) {
        try {
            // Phương pháp 1: Sử dụng Native Query thông qua EntityManager
            String nativeSQL = "DELETE FROM user_friends WHERE user_id = ? AND friend_id = ?";
            int deleted1 = entityManager.createNativeQuery(nativeSQL)
                .setParameter(1, userId)
                .setParameter(2, friendId)
                .executeUpdate();
            
            int deleted2 = entityManager.createNativeQuery(nativeSQL)
                .setParameter(1, friendId)
                .setParameter(2, userId)
                .executeUpdate();
            
            System.out.println("EntityManager Native SQL: Đã xóa " + deleted1 + " + " + deleted2 + " = " + (deleted1 + deleted2) + " bản ghi");
            
            // Phương pháp 2: Sử dụng Native Query thông qua FriendshipRepository (phương thức có sẵn)
            int deleted3 = friendshipRepository.deleteUserFriendsRelation(userId, friendId);
            int deleted4 = friendshipRepository.deleteUserFriendsRelation(friendId, userId);
            System.out.println("Repository Native SQL: Đã xóa " + deleted3 + " + " + deleted4 + " = " + (deleted3 + deleted4) + " bản ghi");
            
            // Phương pháp 3: Sử dụng phương thức tổng hợp trong repository
            int deleted5 = friendshipRepository.forceDeleteUserFriendsRelation(userId, friendId);
            System.out.println("Force Delete: Đã xóa " + deleted5 + " bản ghi");
            
            // Đảm bảo thay đổi được đẩy xuống database ngay lập tức
            entityManager.flush();
        } catch (Exception e) {
            System.err.println("Lỗi khi xóa trực tiếp bạn bè: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Phương thức để sửa lỗi quan hệ bạn bè không đồng bộ trong database
     * - Nếu friendship status=ACCEPTED nhưng không có trong user_friends: thêm vào user_friends
     * - Nếu có trong user_friends nhưng không có friendship hoặc status khác ACCEPTED: xóa khỏi user_friends
     */
    @Transactional
    public void fixFriendshipConsistency(Long userId1, Long userId2) throws UserException {
        User user1 = findUserById(userId1);
        User user2 = findUserById(userId2);
        
        // Kiểm tra trạng thái trong bảng friendships
        var friendship1 = friendshipRepository.findByUserAndFriend(user1, user2);
        var friendship2 = friendshipRepository.findByUserAndFriend(user2, user1);
        
        boolean shouldBeFriends = 
            (friendship1.isPresent() && friendship1.get().getStatus() == Friendship.FriendshipStatus.ACCEPTED) ||
            (friendship2.isPresent() && friendship2.get().getStatus() == Friendship.FriendshipStatus.ACCEPTED);
        
        // Kiểm tra trạng thái trong bảng user_friends
        int userFriendsCount = friendshipRepository.countUserFriendsRelation(userId1, userId2);
        boolean areFriendsInTable = userFriendsCount > 0;
        
        if (shouldBeFriends && !areFriendsInTable) {
            // Trường hợp 1: Nên là bạn bè nhưng không có trong bảng user_friends
            // Thêm vào danh sách bạn bè của cả hai
            user1.getFriends().add(user2);
            user2.getFriends().add(user1);
            
            userRepository.save(user1);
            userRepository.save(user2);
            System.out.println("Đã thêm lại quan hệ bạn bè giữa " + userId1 + " và " + userId2);
            
        } else if (!shouldBeFriends && areFriendsInTable) {
            // Trường hợp 2: Không nên là bạn bè nhưng vẫn còn trong bảng user_friends
            // Xóa khỏi bảng user_friends
            directRemoveFriendConnection(userId1, userId2);
            System.out.println("Đã xóa quan hệ bạn bè không hợp lệ giữa " + userId1 + " và " + userId2);
        }
    }

    @Override
    @Transactional
    public void updateOnlineStatus(Long userId, int isOnline) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with id " + userId));
            user.setOnline(isOnline);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        } catch (Exception e) {
            System.err.println("Error updating online status: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public User createUser(UserRequest req) throws UserException {
        // Kiểm tra thông tin bắt buộc
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new UserException("Email không được để trống");
        }
        
        if (req.getFirstName() == null || req.getFirstName().isBlank()) {
            throw new UserException("Họ không được để trống");
        }
        
        if (req.getLastName() == null || req.getLastName().isBlank()) {
            throw new UserException("Tên không được để trống");
        }
        
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new UserException("Mật khẩu không được để trống");
        }
        
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.findByEmail(req.getEmail()) != null) {
            throw new UserException("Email đã được sử dụng");
        }
        
        // Tạo user mới
        User newUser = new User();
        newUser.setFirstName(req.getFirstName());
        newUser.setLastName(req.getLastName());
        newUser.setEmail(req.getEmail());
        newUser.setPassword(passwordEncoder.encode(req.getPassword()));
        newUser.setAdmin(false); // Đảm bảo người dùng mới không phải admin
        
        if (req.getIsActive() != null) {
            newUser.setIsActive(req.getIsActive());
        } else {
            newUser.setIsActive(true);
        }
        
        // Thiết lập các giá trị mặc định
        if (req.getImage() != null) {
            newUser.setImage(req.getImage());
        } else {
            newUser.setImage("/placeholder-user.jpg");
        }
        
        if (req.getPhone() != null) {
            newUser.setPhone(req.getPhone());
        }
        
        if (req.getBio() != null) {
            newUser.setBio(req.getBio());
        }
        
        if (req.getBirthDate() != null) {
            newUser.setBirthDate(req.getBirthDate());
        }
        
        if (req.getGender() != null) {
            try {
                newUser.setGender(User.Gender.fromFrontendValue(req.getGender()));
            } catch (IllegalArgumentException e) {
                // Bỏ qua lỗi nếu giới tính không hợp lệ
            }
        }
        
        newUser.setIsEmailVerified(false);
        newUser.setPostsCount(0);
        
        // Lưu user
        return userRepository.save(newUser);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public User updateUser(Long userId, UserRequest req) throws UserException {
        User user = findUserById(userId);
        
        // Cập nhật thông tin
        if (req.getFirstName() != null && !req.getFirstName().isBlank()) {
            user.setFirstName(req.getFirstName());
        }
        
        if (req.getLastName() != null && !req.getLastName().isBlank()) {
            user.setLastName(req.getLastName());
        }
        
        if (req.getImage() != null) {
            user.setImage(req.getImage());
        }
        
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone());
        }
        
        if (req.getBio() != null) {
            user.setBio(req.getBio());
        }
        
        // Email không được thay đổi nếu đã xác thực
        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
                throw new UserException("Không thể thay đổi email đã xác thực");
            }
            
            // Kiểm tra email đã tồn tại chưa
            if (userRepository.findByEmail(req.getEmail()) != null) {
                throw new UserException("Email đã được sử dụng");
            }
            
            user.setEmail(req.getEmail());
            user.setIsEmailVerified(false);
        }
        
        // Cập nhật mật khẩu nếu có
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        
        // Lưu cập nhật
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    @Override
    public Page<User> findAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
    
    @Override
    public Page<User> findActiveUsers(Pageable pageable) {
        return userRepository.findByIsActive(true, pageable);
    }
    
    @Override
    public Page<User> findLockedUsers(Pageable pageable) {
        return userRepository.findByIsActive(false, pageable);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public User lockUser(Long userId) throws UserException {
        User user = findUserById(userId);
        
        // Log để debug
        logger.info("Thực hiện khóa tài khoản: ID={}, Email={}", userId, user.getEmail());
        
        // Kiểm tra xem user này có phải là admin không - chỉ kiểm tra @admin.com và admin@phanlop.com
        if (user.getEmail() != null) {
            boolean isAdminEmail = user.getEmail().endsWith("@admin.com") || 
                                user.getEmail().equals("admin@phanlop.com");
            
            if (isAdminEmail) {
                logger.warn("Không thể khóa tài khoản admin với email: {}", user.getEmail());
                throw new UserException("Không thể khóa tài khoản admin");
            }
        }
        
        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId")
    public User unlockUser(Long userId) throws UserException {
        User user = findUserById(userId);
        
        user.setIsActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
}