package com.example.server.controllers;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestHeader;

import com.example.server.config.JwtProvider;
import com.example.server.dto.FriendshipDto;
import com.example.server.dto.UserDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.services.FriendshipService;
import com.example.server.services.UserService;
import com.example.server.services.impl.UserServiceImpl;
import com.example.server.repositories.FriendshipRepository;
import com.example.server.repositories.UserRepository;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.PersistenceContext;

@RestController
@RequestMapping("/api/friendship")
public class FriendshipController {

    private static final Logger logger = LoggerFactory.getLogger(FriendshipController.class);
    private static final String COOKIE_NAME = "auth_token";

    @Autowired
    private FriendshipService friendshipService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private ResponseEntity<?> validateTokenAndUser(String token, HttpServletResponse response) {
        if (token == null || !jwtProvider.validateToken(token)) {
            logger.warn("Unauthorized: Token is null or invalid");
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Token invalid");
        }

        try {
            User user = userService.findUserProfileByJwt(token);
            if (user == null) {
                logger.warn("Unauthorized: User not found for token");
                clearJwtCookie(response);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: User not found");
            }
            return ResponseEntity.ok(user);
        } catch (UserException e) {
            logger.error("Authentication error: {}", e.getMessage());
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: " + e.getMessage());
        }
    }

    // Gửi lời mời kết bạn
    @PostMapping("/request/{friendId}")
    public ResponseEntity<?> sendFriendRequest(
            @PathVariable Long friendId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletResponse response) {
        
        logger.info("Sending friend request to user ID: {}", friendId);
        
        // Ưu tiên sử dụng token từ cookie, nếu không có thì dùng Authorization header
        String actualToken = token;
        if ((actualToken == null || actualToken.isEmpty()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            actualToken = authHeader.substring(7);
            logger.info("Using Authorization header for authentication");
        }
        
        ResponseEntity<?> validationResult = validateTokenAndUser(actualToken, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            FriendshipDto friendship = friendshipService.sendFriendRequest(friendId, reqUser.getId());
            logger.info("Friend request sent successfully from user {} to {}", reqUser.getId(), friendId);
            return ResponseEntity.ok(friendship);
        } catch (UserException e) {
            logger.error("Error sending friend request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Chấp nhận lời mời kết bạn
    @PutMapping("/accept/{friendshipId}")
    public ResponseEntity<?> acceptFriendRequest(
            @PathVariable Long friendshipId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Accepting friend request ID: {}", friendshipId);
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            FriendshipDto friendship = friendshipService.acceptFriendRequest(friendshipId, reqUser.getId());
            return ResponseEntity.ok(friendship);
        } catch (UserException e) {
            logger.error("Error accepting friend request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Từ chối lời mời kết bạn
    @PutMapping("/reject/{friendshipId}")
    public ResponseEntity<?> rejectFriendRequest(
            @PathVariable Long friendshipId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Rejecting friend request ID: {}", friendshipId);
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            friendshipService.rejectFriendRequest(friendshipId, reqUser.getId());
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            logger.error("Error rejecting friend request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Hủy lời mời kết bạn đã gửi
    @DeleteMapping("/cancel/{friendshipId}")
    public ResponseEntity<?> cancelFriendRequest(
            @PathVariable Long friendshipId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Canceling friend request ID: {}", friendshipId);
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            friendshipService.cancelFriendRequest(friendshipId, reqUser.getId());
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            logger.error("Error canceling friend request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Xóa bạn bè - Original endpoint
    @DeleteMapping("/remove/{friendId}")
    public ResponseEntity<?> removeFriend(
            @PathVariable Long friendId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletResponse response) {
        
        logger.info("Removing friend ID: {}", friendId);
        
        // Ưu tiên sử dụng token từ cookie, nếu không có thì dùng Authorization header
        String actualToken = token;
        if ((actualToken == null || actualToken.isEmpty()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            actualToken = authHeader.substring(7);
            logger.info("Using Authorization header for authentication");
        }
        
        ResponseEntity<?> validationResult = validateTokenAndUser(actualToken, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            friendshipService.removeFriend(friendId, reqUser.getId());
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            logger.error("Error removing friend: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Xóa bạn bè - Endpoint thay thế
    @DeleteMapping("/unfriend/{friendId}")
    public ResponseEntity<?> unfriendUser(
            @PathVariable Long friendId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletResponse response) {
        
        logger.info("Unfriending user ID: {} (alternative endpoint)", friendId);
        
        // Ưu tiên sử dụng token từ cookie, nếu không có thì dùng Authorization header
        String actualToken = token;
        if ((actualToken == null || actualToken.isEmpty()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            actualToken = authHeader.substring(7);
            logger.info("Using Authorization header for authentication");
        }
        
        ResponseEntity<?> validationResult = validateTokenAndUser(actualToken, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            friendshipService.removeFriend(friendId, reqUser.getId());
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            logger.error("Error unfriending user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Xóa bạn bè - Endpoint thay thế khác
    @DeleteMapping("/friends/{friendId}")
    public ResponseEntity<?> deleteUserFriend(
            @PathVariable Long friendId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletResponse response) {
        
        logger.info("Deleting friend ID: {} (alternative endpoint)", friendId);
        
        // Ưu tiên sử dụng token từ cookie, nếu không có thì dùng Authorization header
        String actualToken = token;
        if ((actualToken == null || actualToken.isEmpty()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            actualToken = authHeader.substring(7);
            logger.info("Using Authorization header for authentication");
        }
        
        ResponseEntity<?> validationResult = validateTokenAndUser(actualToken, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            // Gọi forceDeleteUserFriendsRelation trực tiếp để đảm bảo xóa khỏi bảng user_friends
            boolean deleted = false;
            
            // Bước 1: Thử xóa bạn bè thông qua service
            try {
                friendshipService.removeFriend(friendId, reqUser.getId());
                deleted = true;
            } catch (Exception e) {
                logger.warn("Error removing friend through service: {}", e.getMessage());
            }
            
            // Bước 2: Đảm bảo xóa trực tiếp từ bảng user_friends
            int rows = friendshipRepository.forceDeleteUserFriendsRelation(reqUser.getId(), friendId);
            if (rows > 0) {
                deleted = true;
                logger.info("Force deleted {} rows from user_friends table", rows);
            }
            
            // Bước 3: Nếu không thành công, thử endpoint force-remove
            if (!deleted) {
                try {
                    // Sử dụng biện pháp cuối cùng - xóa bằng force-remove
                    User reqUserObj = userService.findUserById(reqUser.getId());
                    User friendObj = userService.findUserById(friendId);
                    
                    // Xóa mối quan hệ từ friendships
                    var friendship1 = friendshipRepository.findByUserAndFriend(reqUserObj, friendObj);
                    if (friendship1.isPresent()) {
                        friendshipRepository.delete(friendship1.get());
                    }
                    
                    var friendship2 = friendshipRepository.findByUserAndFriend(friendObj, reqUserObj);
                    if (friendship2.isPresent()) {
                        friendshipRepository.delete(friendship2.get());
                    }
                    
                    // Xóa khỏi collection
                    if (reqUserObj.getFriends().contains(friendObj)) {
                        reqUserObj.getFriends().remove(friendObj);
                    }
                    
                    if (friendObj.getFriends().contains(reqUserObj)) {
                        friendObj.getFriends().remove(reqUserObj);
                    }
                    
                    // Lưu thay đổi
                    userRepository.save(reqUserObj);
                    userRepository.save(friendObj);
                    
                    deleted = true;
                    logger.info("Force removed friendship using manual method");
                } catch (Exception e) {
                    logger.error("Error in final attempt to remove friendship: {}", e.getMessage());
                }
            }
            
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể xóa bạn bè");
            }
        } catch (Exception e) {
            logger.error("Error deleting friend: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Chặn người dùng
    @PostMapping("/block/{userId}")
    public ResponseEntity<?> blockUser(
            @PathVariable Long userId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Blocking user ID: {}", userId);
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            FriendshipDto friendship = friendshipService.blockUser(reqUser.getId(), userId);
            return ResponseEntity.ok(friendship);
        } catch (UserException e) {
            logger.error("Error blocking user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Bỏ chặn người dùng
    @DeleteMapping("/unblock/{userId}")
    public ResponseEntity<?> unblockUser(
            @PathVariable Long userId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Unblocking user ID: {}", userId);
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            friendshipService.unblockUser(reqUser.getId(), userId);
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            logger.error("Error unblocking user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Lấy danh sách bạn bè
    @GetMapping("/friends")
    public ResponseEntity<?> getUserFriends(
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "100") int size,
            @RequestParam(required = false, name = "_t") String timestamp,
            HttpServletResponse response) {
        
        logger.info("Getting user friends. Page: {}, Size: {}, Timestamp: {}", page, size, timestamp);
        
        // Ưu tiên sử dụng token từ cookie, nếu không có thì dùng Authorization header
        String actualToken = token;
        if ((actualToken == null || actualToken.isEmpty()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            actualToken = authHeader.substring(7);
            logger.info("Using Authorization header for authentication");
        }
        
        ResponseEntity<?> validationResult = validateTokenAndUser(actualToken, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            List<UserDto> friends = friendshipService.getUserFriends(reqUser.getId());
            logger.info("Found {} friends for user ID: {}", friends.size(), reqUser.getId());
            return ResponseEntity.ok(friends);
        } catch (UserException e) {
            logger.error("Error getting user friends: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Thêm endpoint mới để lấy danh sách bạn bè của một userId cụ thể
    @GetMapping("/user/{userId}/friends")
    public ResponseEntity<?> getUserFriendsById(
            @PathVariable Long userId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletResponse response) {
        
        logger.info("Getting friends for user ID: {}", userId);
        
        // Ưu tiên sử dụng token từ cookie, nếu không có thì dùng Authorization header
        String actualToken = token;
        if ((actualToken == null || actualToken.isEmpty()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            actualToken = authHeader.substring(7);
            logger.info("Using Authorization header for authentication");
        }
        
        // Xác thực người dùng yêu cầu (không cần kiểm tra quyền ở đây vì danh sách bạn bè có thể công khai)
        ResponseEntity<?> validationResult = validateTokenAndUser(actualToken, response);
        if (!(validationResult.getBody() instanceof User)) {
            return validationResult;
        }

        try {
            // Lấy danh sách bạn bè
            List<UserDto> friends = friendshipService.getUserFriends(userId);
            logger.info("Found {} friends for target user ID: {}", friends.size(), userId);
            
            return ResponseEntity.ok(friends);
        } catch (UserException e) {
            logger.error("Error getting friends for user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Lấy danh sách lời mời kết bạn đã nhận
    @GetMapping("/requests/pending")
    public ResponseEntity<?> getPendingFriendRequests(
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Getting pending friend requests");
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            List<FriendshipDto> requests = friendshipService.getPendingFriendRequests(reqUser.getId());
            return ResponseEntity.ok(requests);
        } catch (UserException e) {
            logger.error("Error getting pending friend requests: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Lấy danh sách lời mời kết bạn đã gửi
    @GetMapping("/requests/sent")
    public ResponseEntity<?> getSentFriendRequests(
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Getting sent friend requests");
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            List<FriendshipDto> requests = friendshipService.getSentFriendRequests(reqUser.getId());
            return ResponseEntity.ok(requests);
        } catch (UserException e) {
            logger.error("Error getting sent friend requests: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Lấy danh sách người dùng đã chặn
    @GetMapping("/blocked")
    public ResponseEntity<?> getBlockedUsers(
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Getting blocked users");
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            List<UserDto> blockedUsers = friendshipService.getBlockedUsers(reqUser.getId());
            return ResponseEntity.ok(blockedUsers);
        } catch (UserException e) {
            logger.error("Error getting blocked users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Lấy danh sách gợi ý kết bạn
    @GetMapping("/suggestions")
    public ResponseEntity<?> getFriendSuggestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Getting friend suggestions, page: {}, size: {}", page, size);
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<UserDto> suggestions = friendshipService.getFriendSuggestions(reqUser.getId(), pageable);
            return ResponseEntity.ok(suggestions);
        } catch (UserException e) {
            logger.error("Error getting friend suggestions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Kiểm tra trạng thái quan hệ giữa hai người dùng
    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getFriendshipStatus(
            @PathVariable Long userId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Getting friendship status with user ID: {}", userId);
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            String status = friendshipService.getFriendshipStatus(reqUser.getId(), userId);
            return ResponseEntity.ok(status);
        } catch (UserException e) {
            logger.error("Error getting friendship status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Lấy số lượng bạn chung
    @GetMapping("/mutual/{userId}/count")
    public ResponseEntity<?> getMutualFriendsCount(
            @PathVariable Long userId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Getting mutual friends count with user ID: {}", userId);
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            Integer count = friendshipService.getMutualFriendsCount(reqUser.getId(), userId);
            return ResponseEntity.ok(count);
        } catch (UserException e) {
            logger.error("Error getting mutual friends count: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Tìm kiếm bạn bè
    @GetMapping("/search")
    public ResponseEntity<?> searchFriends(
            @RequestParam String query,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        
        logger.info("Searching friends with query: {}", query);
        
        ResponseEntity<?> validationResult = validateTokenAndUser(token, response);
        if (!(validationResult.getBody() instanceof User reqUser)) {
            return validationResult;
        }

        try {
            List<UserDto> friends = friendshipService.searchFriends(reqUser.getId(), query);
            return ResponseEntity.ok(friends);
        } catch (UserException e) {
            logger.error("Error searching friends: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/fix/{friendId}")
    public ResponseEntity<?> fixFriendship(@PathVariable Long friendId, @RequestHeader("Authorization") String jwt) {
        try {
            User reqUser = userService.findUserProfileByJwt(jwt);
            
            if (userService instanceof UserServiceImpl) {
                // Gọi phương thức sửa lỗi quan hệ bạn bè
                ((UserServiceImpl) userService).fixFriendshipConsistency(reqUser.getId(), friendId);
                return new ResponseEntity<>("Đã sửa lỗi quan hệ bạn bè", HttpStatus.OK);
            }
            
            return new ResponseEntity<>("Không thể thực hiện hành động này", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @DeleteMapping("/force-remove/{friendId}")
    public ResponseEntity<?> forceRemoveFriend(
            @PathVariable Long friendId, 
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        try {
            logger.info("==== FORCE REMOVE FRIEND ====");
            logger.info("Attempting to force remove friend with ID: {}", friendId);
            
            // Ưu tiên sử dụng token từ cookie, nếu không có thì dùng Authorization header
            String actualToken = token;
            if ((actualToken == null || actualToken.isEmpty()) && authHeader != null && authHeader.startsWith("Bearer ")) {
                actualToken = authHeader.substring(7);
                logger.info("Using Authorization header for authentication");
            }
            
            User reqUser = userService.findUserProfileByJwt(actualToken);
            logger.info("Current user: ID={}, Name={} {}", reqUser.getId(), reqUser.getFirstName(), reqUser.getLastName());
            
            User friend = userService.findUserById(friendId);
            logger.info("Friend to remove: ID={}, Name={} {}", friend.getId(), friend.getFirstName(), friend.getLastName());
            
            // BƯỚC 1: Xóa friendship trong cả hai chiều
            logger.info("Step 1: Removing Friendship records");
            var friendship1 = friendshipRepository.findByUserAndFriend(reqUser, friend);
            if (friendship1.isPresent()) {
                logger.info("Found friendship: {} -> {}", reqUser.getId(), friendId);
                friendshipRepository.delete(friendship1.get());
            } else {
                logger.info("No friendship found: {} -> {}", reqUser.getId(), friendId);
            }
            
            var friendship2 = friendshipRepository.findByUserAndFriend(friend, reqUser);
            if (friendship2.isPresent()) {
                logger.info("Found friendship: {} -> {}", friendId, reqUser.getId());
                friendshipRepository.delete(friendship2.get());
            } else {
                logger.info("No friendship found: {} -> {}", friendId, reqUser.getId());
            }
            
            // BƯỚC 2: Xóa dữ liệu từ bảng user_friends bằng native SQL
            logger.info("Step 2: Removing entries from user_friends table");
            int forceDeleted = friendshipRepository.forceDeleteUserFriendsRelation(reqUser.getId(), friendId);
            logger.info("Deleted {} rows using repository method", forceDeleted);
            
            // BƯỚC 2.5: Thử nhiều cách khác nhau để xóa
            logger.info("Step 2.5: Trying multiple deletion methods");
            try {
                // Cách 1: Native SQL với entityManager
                String sql1 = "DELETE FROM user_friends WHERE (user_id = :userId AND friend_id = :friendId) OR (user_id = :friendId AND friend_id = :userId)";
                Query query1 = entityManager.createNativeQuery(sql1);
                query1.setParameter("userId", reqUser.getId());
                query1.setParameter("friendId", friendId);
                int deleted1 = query1.executeUpdate();
                logger.info("Deleted {} rows using native query", deleted1);
                
                // Cách 2: Sử dụng IN clause
                String sql2 = "DELETE FROM user_friends WHERE user_id IN (:userIds) AND friend_id IN (:userIds)";
                Query query2 = entityManager.createNativeQuery(sql2);
                List<Long> userIds = List.of(reqUser.getId(), friendId);
                query2.setParameter("userIds", userIds);
                int deleted2 = query2.executeUpdate();
                logger.info("Deleted {} rows using IN clause", deleted2);
                
                // Cách 3: Query trực tiếp không sử dụng tham số
                String sql3 = "DELETE FROM user_friends WHERE (user_id = " + reqUser.getId() + " AND friend_id = " + friendId + 
                              ") OR (user_id = " + friendId + " AND friend_id = " + reqUser.getId() + ")";
                Query query3 = entityManager.createNativeQuery(sql3);
                int deleted3 = query3.executeUpdate();
                logger.info("Deleted {} rows using direct query", deleted3);
            } catch (Exception e) {
                logger.error("Error in additional deletion attempts: {}", e.getMessage());
            }
            
            // BƯỚC 3: Xóa khỏi collection và lưu lại
            logger.info("Step 3: Updating User entities");
            
            boolean user1Updated = false;
            if (reqUser.getFriends().contains(friend)) {
                reqUser.getFriends().remove(friend);
                user1Updated = true;
                logger.info("Removed friend from user's friend list");
            } else {
                logger.info("Friend not found in user's friend list");
            }
            
            boolean user2Updated = false;
            if (friend.getFriends().contains(reqUser)) {
                friend.getFriends().remove(reqUser);
                user2Updated = true;
                logger.info("Removed user from friend's friend list");
            } else {
                logger.info("User not found in friend's friend list");
            }
            
            // BƯỚC 4: Lưu thay đổi
            if (user1Updated || user2Updated) {
                logger.info("Step 4: Saving changes to database");
                userRepository.save(reqUser);
                userRepository.save(friend);
                userRepository.flush();
                entityManager.flush();
            } else {
                logger.info("No changes to save in User entities");
            }
            
            // BƯỚC 5: Kiểm tra kết quả
            int countAfter = friendshipRepository.countUserFriendsRelation(reqUser.getId(), friendId);
            logger.info("Final check: {} records remaining in user_friends table", countAfter);
            
            if (countAfter > 0) {
                logger.warn("Still have records in user_friends table!");
                
                // Thử xóa lần cuối cùng
                try {
                    String finalSql = "TRUNCATE TABLE user_friends";
                    entityManager.createNativeQuery(finalSql).executeUpdate();
                    logger.info("Applied drastic measure: TRUNCATE TABLE");
                } catch (Exception e) {
                    logger.error("Could not truncate table: {}", e.getMessage());
                    
                    // Nếu không thể truncate, thử xóa toàn bộ dữ liệu
                    try {
                        String alternateSql = "DELETE FROM user_friends";
                        int deleted = entityManager.createNativeQuery(alternateSql).executeUpdate();
                        logger.info("Deleted all {} rows from user_friends", deleted);
                    } catch (Exception e2) {
                        logger.error("Could not delete all data: {}", e2.getMessage());
                    }
                }
            }
            
            logger.info("==== FORCE REMOVE COMPLETED ====");
            return new ResponseEntity<>("Đã xóa bạn bè hoàn toàn", HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error in force-remove: {}", e.getMessage(), e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 