package com.example.server.services.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.server.dto.FriendshipDto;
import com.example.server.dto.UserDto;
import com.example.server.exception.UserException;
import com.example.server.mapper.FriendshipDtoMapper;
import com.example.server.mapper.UserDtoMapper;
import com.example.server.models.Friendship;
import com.example.server.models.Friendship.FriendshipStatus;
import com.example.server.models.User;
import com.example.server.repositories.FriendshipRepository;
import com.example.server.repositories.UserRepository;
import com.example.server.services.FriendshipService;
import com.example.server.services.NotificationService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.data.util.Pair;

@Service
public class FriendshipServiceImpl implements FriendshipService {

    private static final Logger logger = LoggerFactory.getLogger(FriendshipServiceImpl.class);

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private FriendshipDtoMapper friendshipDtoMapper;

    @Autowired
    private UserDtoMapper userDtoMapper;

    private User findUserById(Long userId) throws UserException {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserException("Không tìm thấy người dùng với ID: " + userId));
    }
    
    // Phương thức hỗ trợ xóa dữ liệu trực tiếp bằng native query
    private int executeNativeDelete(String sql, Long userId, Long friendId) {
        try {
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("userId", userId);
            query.setParameter("friendId", friendId);
            return query.executeUpdate();
        } catch (Exception e) {
            logger.error("Lỗi khi thực hiện native query: {}", e.getMessage(), e);
            return 0;
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = {"users", "friendships"}, allEntries = true)
    public FriendshipDto sendFriendRequest(Long friendId, Long userId) throws UserException {
        logger.info("=== BẮT ĐẦU GỬI LỜI MỜI KẾT BẠN === userId: {}, friendId: {}", userId, friendId);
        
        if (friendId.equals(userId)) {
            logger.error("Không thể gửi lời mời kết bạn cho chính mình");
            throw new UserException("Không thể gửi lời mời kết bạn cho chính mình");
        }

        User user = findUserById(userId);
        User friend = findUserById(friendId);
        logger.info("Đã tìm thấy user: {} và friend: {}", user.getId(), friend.getId());

        // Kiểm tra xem đã có mối quan hệ nào chưa
        var existingFriendship = friendshipRepository.findByUserAndFriend(user, friend);
        if (existingFriendship.isPresent()) {
            Friendship friendship = existingFriendship.get();
            logger.info("Tìm thấy mối quan hệ đã tồn tại từ {} đến {} với trạng thái {}", userId, friendId, friendship.getStatus());
            
            if (friendship.getStatus() == FriendshipStatus.PENDING) {
                logger.warn("Đã gửi lời mời kết bạn rồi");
                throw new UserException("Đã gửi lời mời kết bạn cho người này rồi");
            } else if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
                logger.warn("Đã là bạn bè rồi");
                throw new UserException("Đã là bạn bè rồi");
            } else if (friendship.getStatus() == FriendshipStatus.BLOCKED) {
                logger.warn("Không thể gửi lời mời kết bạn cho người dùng bị chặn");
                throw new UserException("Không thể gửi lời mời kết bạn cho người dùng này");
            }
            // Nếu trạng thái là REJECTED, ta có thể gửi lại lời mời
            logger.info("Gửi lại lời mời đã bị từ chối trước đó");
            friendship.setStatus(FriendshipStatus.PENDING);
            friendship.setUpdatedAt(LocalDateTime.now());
            Friendship savedFriendship = friendshipRepository.save(friendship);
            
            // Tạo thông báo cho người được gửi lời mời
            notificationService.createFriendRequestNotification(user, friend);
            
            return friendshipDtoMapper.toFriendshipDto(savedFriendship);
        }

        // Kiểm tra xem đã có lời mời từ người kia chưa
        var existingReverseFriendship = friendshipRepository.findByUserAndFriend(friend, user);
        if (existingReverseFriendship.isPresent()) {
            Friendship friendship = existingReverseFriendship.get();
            logger.info("Tìm thấy mối quan hệ ngược lại từ {} đến {} với trạng thái {}", 
                        friendId, userId, friendship.getStatus());
            
            if (friendship.getStatus() == FriendshipStatus.PENDING) {
                // Chấp nhận lời mời đã có
                logger.info("Đã có lời mời từ {}, tự động chấp nhận", friendId);
                
                // Tạo mối quan hệ bạn bè hai chiều
                Pair<Friendship, Friendship> friendships = ensureBidirectionalFriendship(
                        user, friend, FriendshipStatus.ACCEPTED);
                
                // Cập nhật danh sách bạn bè
                user.getFriends().add(friend);
                friend.getFriends().add(user);
                
                userRepository.save(user);
                userRepository.save(friend);
                userRepository.flush();
                
                // Tạo thông báo cho người đã gửi lời mời trước đó
                notificationService.createFriendAcceptedNotification(user, friend);
                
                logger.info("=== HOÀN THÀNH GỬI & CHẤP NHẬN LỜI MỜI KẾT BẠN ===");
                return friendshipDtoMapper.toFriendshipDto(friendships.getFirst());
                
            } else if (friendship.getStatus() == FriendshipStatus.BLOCKED) {
                logger.warn("Bị chặn bởi người dùng {}", friendId);
                throw new UserException("Không thể gửi lời mời kết bạn cho người dùng này");
            }
        }

        // Tạo mới lời mời kết bạn
        logger.info("Tạo mới lời mời kết bạn từ {} đến {}", userId, friendId);
        Friendship friendship = new Friendship();
        friendship.setUser(user);
        friendship.setFriend(friend);
        friendship.setStatus(FriendshipStatus.PENDING);
        friendship.setCreatedAt(LocalDateTime.now());
        friendship.setUpdatedAt(LocalDateTime.now());

        // Tính toán số bạn chung
        Integer mutualCount = friendshipRepository.countMutualFriends(user, friend);
        friendship.setMutualFriendsCount(mutualCount != null ? mutualCount : 0);

        Friendship savedFriendship = friendshipRepository.save(friendship);
        logger.info("Đã tạo yêu cầu kết bạn từ {} đến {} với ID {}", user.getId(), friend.getId(), savedFriendship.getId());
        
        // Tạo thông báo cho người được gửi lời mời
        notificationService.createFriendRequestNotification(user, friend);
        
        logger.info("=== HOÀN THÀNH GỬI LỜI MỜI KẾT BẠN ===");
        return friendshipDtoMapper.toFriendshipDto(savedFriendship);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"users", "friendships"}, allEntries = true)
    public FriendshipDto acceptFriendRequest(Long friendshipId, Long userId) throws UserException {
        logger.info("=== BẮT ĐẦU CHẤP NHẬN LỜI MỜI KẾT BẠN === friendshipId: {}, userId: {}", friendshipId, userId);
        
        User user = findUserById(userId);
        logger.info("Người nhận lời mời (user): {}", user.getId());
        
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new UserException("Không tìm thấy lời mời kết bạn"));
        logger.info("Tìm thấy lời mời kết bạn: {} (user_id={}, friend_id={}, status={})", 
                friendshipId, friendship.getUser().getId(), friendship.getFriend().getId(), friendship.getStatus());

        // Kiểm tra người nhận lời mời có phải là người hiện tại không
        if (!friendship.getFriend().getId().equals(userId)) {
            logger.error("Lỗi: Người dùng {} không phải là người nhận lời mời kết bạn này (expected: {})", 
                    userId, friendship.getFriend().getId());
            throw new UserException("Không có quyền chấp nhận lời mời kết bạn này");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            logger.error("Lỗi: Lời mời kết bạn không còn ở trạng thái PENDING (current: {})", friendship.getStatus());
            throw new UserException("Lời mời kết bạn không còn hiệu lực");
        }

        try {
            // Lấy người gửi lời mời
            User friend = friendship.getUser();
            logger.info("Người gửi lời mời (friend): {}", friend.getId());
            
            // Đảm bảo tạo mối quan hệ bạn bè hai chiều
            Pair<Friendship, Friendship> friendships = ensureBidirectionalFriendship(
                    user, friend, FriendshipStatus.ACCEPTED);
            
            // Cập nhật danh sách bạn bè trong entity
            if (!user.getFriends().contains(friend)) {
                user.getFriends().add(friend);
            }
            if (!friend.getFriends().contains(user)) {
                friend.getFriends().add(user);
            }
            
            userRepository.save(user);
            userRepository.save(friend);
            
            // Tạo thông báo cho người đã gửi lời mời
            notificationService.createFriendAcceptedNotification(user, friend);
            
            logger.info("=== HOÀN THÀNH CHẤP NHẬN LỜI MỜI KẾT BẠN ===");
            return friendshipDtoMapper.toFriendshipDto(friendships.getFirst());
        } catch (Exception e) {
            logger.error("Lỗi khi chấp nhận lời mời kết bạn: {}", e.getMessage(), e);
            throw new UserException("Lỗi khi chấp nhận lời mời kết bạn: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = {"users", "friendships"}, allEntries = true)
    public void rejectFriendRequest(Long friendshipId, Long userId) throws UserException {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new UserException("Không tìm thấy lời mời kết bạn"));

        // Kiểm tra người nhận lời mời có phải là người hiện tại không
        if (!friendship.getFriend().getId().equals(userId)) {
            throw new UserException("Không có quyền từ chối lời mời kết bạn này");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new UserException("Lời mời kết bạn không còn hiệu lực");
        }

        // Từ chối lời mời
        friendship.setStatus(FriendshipStatus.REJECTED);
        friendship.setUpdatedAt(LocalDateTime.now());
        friendshipRepository.save(friendship);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"users", "friendships"}, allEntries = true)
    public void cancelFriendRequest(Long friendshipId, Long userId) throws UserException {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new UserException("Không tìm thấy lời mời kết bạn"));

        // Kiểm tra người gửi lời mời có phải là người hiện tại không
        if (!friendship.getUser().getId().equals(userId)) {
            throw new UserException("Không có quyền hủy lời mời kết bạn này");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new UserException("Lời mời kết bạn không còn hiệu lực");
        }

        // Xóa lời mời
        friendshipRepository.delete(friendship);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"users", "friendships"}, allEntries = true)
    public void removeFriend(Long friendId, Long userId) throws UserException {
        logger.info("===== BẮT ĐẦU XÓA BẠN BÈ ===== UserId: {}, FriendId: {}", userId, friendId);
        
        try {
            User user = findUserById(userId);
            User friend = findUserById(friendId);

            logger.info("Thông tin người dùng: User({}), Friend({})", user.getId(), friend.getId());

            // Kiểm tra quan hệ bạn bè
            var existingFriendship = friendshipRepository.findByUserAndFriend(user, friend);
            var existingReverseFriendship = friendshipRepository.findByUserAndFriend(friend, user);

            // Kiểm tra xem có tồn tại mối quan hệ bạn bè không
            boolean hasFriendship = existingFriendship.isPresent() && existingFriendship.get().getStatus() == FriendshipStatus.ACCEPTED;
            boolean hasReverseFriendship = existingReverseFriendship.isPresent() && existingReverseFriendship.get().getStatus() == FriendshipStatus.ACCEPTED;
            
            if (!hasFriendship && !hasReverseFriendship) {
                logger.warn("Không tìm thấy mối quan hệ bạn bè giữa hai người dùng");
                throw new UserException("Không phải là bạn bè");
            }

            // 1. Xóa dữ liệu từ bảng friendship
            if (existingFriendship.isPresent()) {
                logger.info("Xóa friendship: {} -> {}", userId, friendId);
                friendshipRepository.delete(existingFriendship.get());
            }
            
            if (existingReverseFriendship.isPresent()) {
                logger.info("Xóa friendship: {} -> {}", friendId, userId);
                friendshipRepository.delete(existingReverseFriendship.get());
            }
            
            // 2. Xóa trực tiếp từ bảng user_friends bằng SQL hiệu quả nhất
            String sql = "DELETE FROM user_friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)";
            int deleted = executeRawSql(sql, userId, friendId, friendId, userId);
            logger.info("Đã xóa {} dòng từ bảng user_friends", deleted);
            
            // 3. Cập nhật các entity
            if (user.getFriends().contains(friend)) {
                user.getFriends().remove(friend);
                userRepository.save(user);
                logger.info("Đã xóa friend khỏi danh sách của user");
            }
            
            if (friend.getFriends().contains(user)) {
                friend.getFriends().remove(user);
                userRepository.save(friend);
                logger.info("Đã xóa user khỏi danh sách của friend");
            }
            
            // 4. Đảm bảo tất cả thay đổi được lưu vào database
            friendshipRepository.flush();
            userRepository.flush();
            entityManager.flush();
            
            logger.info("==== HOÀN THÀNH XÓA BẠN BÈ ====");
        } catch (Exception e) {
            logger.error("LỖI KHI XÓA BẠN BÈ: {}", e.getMessage(), e);
            throw new UserException("Lỗi khi xóa bạn bè: " + e.getMessage());
        }
    }

    /**
     * Thực thi SQL trực tiếp với tham số
     */
    private int executeRawSql(String sql, Object... params) {
        try {
            Query query = entityManager.createNativeQuery(sql);
            for (int i = 0; i < params.length; i++) {
                query.setParameter(i+1, params[i]);
            }
            return query.executeUpdate();
        } catch (Exception e) {
            logger.error("Lỗi khi thực thi SQL: {} - {}", sql, e.getMessage());
            return 0;
        }
    }

    @Override
    @Transactional
    public FriendshipDto blockUser(Long userId, Long blockUserId) throws UserException {
        User user = findUserById(userId);
        User blockUser = findUserById(blockUserId);

        // Kiểm tra quan hệ hiện tại
        var existingFriendship = friendshipRepository.findByUserAndFriend(user, blockUser);
        
        Friendship friendship;
        if (existingFriendship.isPresent()) {
            friendship = existingFriendship.get();
            
            // Nếu là bạn bè, xóa khỏi danh sách bạn bè
            if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
                user.getFriends().remove(blockUser);
                blockUser.getFriends().remove(user);
                
                userRepository.save(user);
                userRepository.save(blockUser);
            }
            
            friendship.setStatus(FriendshipStatus.BLOCKED);
            friendship.setUpdatedAt(LocalDateTime.now());
        } else {
            // Tạo mới quan hệ chặn
            friendship = new Friendship();
            friendship.setUser(user);
            friendship.setFriend(blockUser);
            friendship.setStatus(FriendshipStatus.BLOCKED);
            friendship.setCreatedAt(LocalDateTime.now());
            friendship.setUpdatedAt(LocalDateTime.now());
            friendship.setMutualFriendsCount(0);
        }
        
        // Xóa bất kỳ lời mời nào từ người bị chặn
        var reverseRequest = friendshipRepository.findByUserAndFriend(blockUser, user);
        if (reverseRequest.isPresent()) {
            friendshipRepository.delete(reverseRequest.get());
        }
        
        return friendshipDtoMapper.toFriendshipDto(friendshipRepository.save(friendship));
    }

    @Override
    @Transactional
    public void unblockUser(Long userId, Long blockedUserId) throws UserException {
        User user = findUserById(userId);
        User blockedUser = findUserById(blockedUserId);

        var existingFriendship = friendshipRepository.findByUserAndFriend(user, blockedUser);
        
        if (existingFriendship.isEmpty() || existingFriendship.get().getStatus() != FriendshipStatus.BLOCKED) {
            throw new UserException("Người dùng này không bị chặn");
        }
        
        friendshipRepository.delete(existingFriendship.get());
    }

    @Override
    @Cacheable(value = "friendships", key = "'friends_' + #userId")
    public List<UserDto> getUserFriends(Long userId) throws UserException {
        User user = findUserById(userId);
        
        List<Friendship> acceptedFriendships = friendshipRepository.findByUserAndStatus(user, FriendshipStatus.ACCEPTED);
        
        return friendshipDtoMapper.toUserDtosFromFriendships(acceptedFriendships, true);
    }

    @Override
    public List<FriendshipDto> getPendingFriendRequests(Long userId) throws UserException {
        User user = findUserById(userId);
        
        List<Friendship> pendingRequests = friendshipRepository.findByFriendAndStatusOrderByCreatedAtDesc(user, FriendshipStatus.PENDING);
        
        return friendshipDtoMapper.toFriendshipDtos(pendingRequests);
    }

    @Override
    public List<FriendshipDto> getSentFriendRequests(Long userId) throws UserException {
        User user = findUserById(userId);
        
        List<Friendship> sentRequests = friendshipRepository.findByUserAndStatusOrderByCreatedAtDesc(user, FriendshipStatus.PENDING);
        
        return friendshipDtoMapper.toFriendshipDtos(sentRequests);
    }

    @Override
    public List<UserDto> getBlockedUsers(Long userId) throws UserException {
        User user = findUserById(userId);
        
        List<Friendship> blockings = friendshipRepository.findByUserAndStatus(user, FriendshipStatus.BLOCKED);
        
        return friendshipDtoMapper.toUserDtosFromFriendships(blockings, true);
    }

    @Override
    public Page<UserDto> getFriendSuggestions(Long userId, Pageable pageable) throws UserException {
        User user = findUserById(userId);
        
        List<User> suggestionUsers = friendshipRepository.findFriendSuggestions(user, pageable);
        
        List<UserDto> suggestionDtos = suggestionUsers.stream()
                .map(u -> userDtoMapper.toUserDto(u))
                .collect(Collectors.toList());
        
        return new PageImpl<>(suggestionDtos, pageable, suggestionDtos.size());
    }

    @Override
    public String getFriendshipStatus(Long userId, Long otherUserId) throws UserException {
        User user = findUserById(userId);
        User otherUser = findUserById(otherUserId);
        
        // Kiểm tra lời mời đã gửi
        var sentRequest = friendshipRepository.findByUserAndFriend(user, otherUser);
        if (sentRequest.isPresent()) {
            return sentRequest.get().getStatus().toString();
        }
        
        // Kiểm tra lời mời đã nhận
        var receivedRequest = friendshipRepository.findByUserAndFriend(otherUser, user);
        if (receivedRequest.isPresent()) {
            return receivedRequest.get().getStatus().toString() + "_RECEIVED";
        }
        
        return "NONE";
    }

    @Override
    @Cacheable(value = "friendships", key = "'mutual_' + #userId + '_' + #otherUserId")
    public Integer getMutualFriendsCount(Long userId, Long otherUserId) throws UserException {
        User user = findUserById(userId);
        User otherUser = findUserById(otherUserId);
        
        Integer count = friendshipRepository.countMutualFriends(user, otherUser);
        return count != null ? count : 0;
    }

    @Override
    public List<UserDto> searchFriends(Long userId, String query) throws UserException {
        User user = findUserById(userId);
        
        List<Friendship> acceptedFriendships = friendshipRepository.findByUserAndStatus(user, FriendshipStatus.ACCEPTED);
        
        List<UserDto> friends = friendshipDtoMapper.toUserDtosFromFriendships(acceptedFriendships, true);
        
        // Lọc theo query
        if (query != null && !query.trim().isEmpty()) {
            String lowercaseQuery = query.toLowerCase();
            return friends.stream()
                    .filter(friend -> 
                        (friend.getFirstName() + " " + friend.getLastName()).toLowerCase().contains(lowercaseQuery) ||
                        (friend.getEmail() != null && friend.getEmail().toLowerCase().contains(lowercaseQuery)))
                    .collect(Collectors.toList());
        }
        
        return friends;
    }

    /**
     * Phương thức đảm bảo tạo mối quan hệ bạn bè hai chiều
     * @param user1 Người dùng thứ nhất
     * @param user2 Người dùng thứ hai
     * @param status Trạng thái của mối quan hệ
     * @return Cặp mối quan hệ bạn bè đã được tạo/cập nhật
     */
    @Transactional
    private Pair<Friendship, Friendship> ensureBidirectionalFriendship(User user1, User user2, FriendshipStatus status) {
        logger.info("Đảm bảo mối quan hệ bạn bè hai chiều giữa {} và {} với trạng thái {}", 
                user1.getId(), user2.getId(), status);
        
        // Tìm hoặc tạo mối quan hệ từ user1 đến user2
        Friendship friendship1 = friendshipRepository.findByUserAndFriend(user1, user2)
                .orElse(new Friendship());
        
        // Nếu là mối quan hệ mới, cài đặt các thông tin cơ bản
        if (friendship1.getId() == null) {
            friendship1.setUser(user1);
            friendship1.setFriend(user2);
            friendship1.setCreatedAt(LocalDateTime.now());
            logger.info("Tạo mới mối quan hệ từ {} đến {}", user1.getId(), user2.getId());
        } else {
            logger.info("Cập nhật mối quan hệ đã tồn tại từ {} đến {} (ID: {})", 
                    user1.getId(), user2.getId(), friendship1.getId());
        }
        
        // Cập nhật trạng thái và thời gian
        friendship1.setStatus(status);
        friendship1.setUpdatedAt(LocalDateTime.now());
        
        // Tính số bạn chung
        Integer mutualCount = friendshipRepository.countMutualFriends(user1, user2);
        friendship1.setMutualFriendsCount(mutualCount != null ? mutualCount : 0);
        
        // Tìm hoặc tạo mối quan hệ từ user2 đến user1
        Friendship friendship2 = friendshipRepository.findByUserAndFriend(user2, user1)
                .orElse(new Friendship());
        
        // Nếu là mối quan hệ mới, cài đặt các thông tin cơ bản
        if (friendship2.getId() == null) {
            friendship2.setUser(user2);
            friendship2.setFriend(user1);
            friendship2.setCreatedAt(LocalDateTime.now());
            logger.info("Tạo mới mối quan hệ từ {} đến {}", user2.getId(), user1.getId());
        } else {
            logger.info("Cập nhật mối quan hệ đã tồn tại từ {} đến {} (ID: {})", 
                    user2.getId(), user1.getId(), friendship2.getId());
        }
        
        // Cập nhật trạng thái và thời gian
        friendship2.setStatus(status);
        friendship2.setUpdatedAt(LocalDateTime.now());
        
        // Tính số bạn chung
        friendship2.setMutualFriendsCount(friendship1.getMutualFriendsCount());
        
        // Lưu cả hai mối quan hệ
        Friendship saved1 = friendshipRepository.save(friendship1);
        Friendship saved2 = friendshipRepository.save(friendship2);
        
        // Đảm bảo thay đổi được ghi xuống database
        friendshipRepository.flush();
        
        logger.info("Đã lưu mối quan hệ hai chiều: {} <-> {} với trạng thái {}", 
                user1.getId(), user2.getId(), status);
        
        return Pair.of(saved1, saved2);
    }
} 