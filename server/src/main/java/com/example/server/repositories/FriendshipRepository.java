package com.example.server.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.server.models.Friendship;
import com.example.server.models.Friendship.FriendshipStatus;
import com.example.server.models.User;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    
    // Tìm friendship giữa hai người dùng
    Optional<Friendship> findByUserAndFriend(User user, User friend);
    
    // Lấy danh sách bạn bè của một người dùng (đã chấp nhận)
    List<Friendship> findByUserAndStatus(User user, FriendshipStatus status);
    
    // Lấy danh sách lời mời kết bạn đã gửi
    List<Friendship> findByUserAndStatusOrderByCreatedAtDesc(User user, FriendshipStatus status);
    
    // Lấy danh sách lời mời kết bạn đã nhận
    List<Friendship> findByFriendAndStatusOrderByCreatedAtDesc(User friend, FriendshipStatus status);
    
    // Đếm số lượng bạn chung giữa hai người dùng
    @Query("SELECT COUNT(f1) FROM Friendship f1 JOIN Friendship f2 ON f1.friend = f2.friend " +
           "WHERE f1.user = :user1 " +
           "AND f2.user = :user2 AND f1.status = 'ACCEPTED' AND f2.status = 'ACCEPTED'")
    Integer countMutualFriends(@Param("user1") User user1, @Param("user2") User user2);
    
    // Lấy danh sách bạn bè được đề xuất (dựa trên bạn chung)
    @Query("SELECT f2.user FROM Friendship f1 JOIN Friendship f2 ON f1.friend = f2.friend " +
           "WHERE f1.user = :user " +
           "AND f2.user != :user AND f1.status = 'ACCEPTED' AND f2.status = 'ACCEPTED' " +
           "AND NOT EXISTS (SELECT 1 FROM Friendship f3 WHERE (f3.user = :user AND f3.friend = f2.user) " +
           "OR (f3.user = f2.user AND f3.friend = :user)) " +
           "GROUP BY f2.user ORDER BY COUNT(f2.user) DESC")
    List<User> findFriendSuggestions(@Param("user") User user, Pageable pageable);
    
    // Xóa trực tiếp quan hệ bạn bè từ bảng user_friends bằng native query
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_friends WHERE user_id = :userId AND friend_id = :friendId", nativeQuery = true)
    int deleteUserFriendsRelation(@Param("userId") Long userId, @Param("friendId") Long friendId);
    
    // Phương pháp xóa bổ sung để đảm bảo dữ liệu được xóa hoàn toàn
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_friends WHERE (user_id = :userId AND friend_id = :friendId) OR (user_id = :friendId AND friend_id = :userId)", nativeQuery = true)
    int forceDeleteUserFriendsRelation(@Param("userId") Long userId, @Param("friendId") Long friendId);
    
    // Phương thức kiểm tra sự tồn tại của quan hệ bạn bè trong bảng user_friends
    @Query(value = "SELECT COUNT(*) FROM user_friends WHERE (user_id = :userId AND friend_id = :friendId) OR (user_id = :friendId AND friend_id = :userId)", nativeQuery = true)
    int countUserFriendsRelation(@Param("userId") Long userId, @Param("friendId") Long friendId);
    
    // Phương thức để xóa quan hệ bạn bè không còn hợp lệ (đã xóa friendship nhưng user_friends vẫn còn)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_friends WHERE (user_id = :userId1 AND friend_id = :userId2) " +
           "AND NOT EXISTS (SELECT 1 FROM friendships f WHERE " +
           "((f.user_id = :userId1 AND f.friend_id = :userId2) OR (f.user_id = :userId2 AND f.friend_id = :userId1)) " +
           "AND f.status = 'ACCEPTED')", nativeQuery = true)
    int cleanupInvalidUserFriends(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    // Tìm các lời mời kết bạn đang chờ xử lý giữa hai người dùng
    @Query("SELECT f FROM Friendship f WHERE " +
           "((f.user.id = :userId1 AND f.friend.id = :userId2) OR (f.user.id = :userId2 AND f.friend.id = :userId1)) " +
           "AND f.status = 'PENDING'")
    List<Friendship> findPendingRequestsBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
} 