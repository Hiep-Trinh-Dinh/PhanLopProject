package com.example.server.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.server.config.JwtProvider;
import com.example.server.dto.UserDto;
import com.example.server.exception.UserException;
import com.example.server.mapper.UserDtoMapper;
import com.example.server.models.FriendRequest;
import com.example.server.models.User;
import com.example.server.repositories.FriendRequestRepository;
import com.example.server.services.UserService;
import com.example.server.services.impl.UserServiceImpl;
import com.example.server.utils.UserUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private UserService userService;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Value("${app.secure:true}")
    private boolean secureCookie;

    private static final String COOKIE_NAME = "auth_token";

    @Autowired
    private UserDtoMapper userDtoMapper;

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateUser(
            @Valid @RequestBody UserDto req,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) {
        logger.info("Received update user request with token: {}", token);

        try {
            // Kiểm tra token từ cookie
            if (token == null || !jwtProvider.validateToken(token)) {
                logger.warn("Invalid or missing token");
                clearJwtCookie(response);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                errorResponse.put("errorMessage", "Invalid or missing authentication token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(errorResponse);
            }

            // Lấy thông tin user từ token
            User reqUser = userService.findUserProfileByJwt(token);
            if (reqUser == null) {
                logger.warn("User not found for token");
                clearJwtCookie(response);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                errorResponse.put("errorMessage", "User not found for provided token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(errorResponse);
            }

            // Cập nhật thông tin user
            logger.debug("Updating user with id: {}", reqUser.getId());
            User updatedUser = userService.updateUser(reqUser.getId(), req);
            UserDto userDto = userDtoMapper.toUserDto(updatedUser);

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("data", userDto);
            successResponse.put("message", "User updated successfully");

            logger.info("Successfully updated user with id: {}", reqUser.getId());
            return ResponseEntity.ok(successResponse);

        } catch (UserException e) {
            logger.error("User exception during update: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Bad Request");
            errorResponse.put("errorMessage", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse);
        } catch (Exception e) {
            logger.error("Unexpected error during update: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal Server Error");
            errorResponse.put("errorMessage", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserId(
        @PathVariable Long userId, 
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) throws UserException {
        // Kiểm tra token
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.findUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        UserDto userDto = userDtoMapper.toUserDto(user);
        userDto.setIsRequestingUser(UserUtil.isReqUser(reqUser, user));
        userDto.setFollowed(UserUtil.isFollowingByReqUser(reqUser, user));

        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserDto>> searchUser(
        @RequestParam String query,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) Boolean force,
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        @RequestHeader(value = "X-Force-Refresh", required = false) String forceRefreshHeader,
        HttpServletResponse response
    ) throws UserException {
        logger.info("Search user with query: {}, force: {}, forceHeader: {}", 
                   query, force, forceRefreshHeader != null);
        
        // Kiểm tra token
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Xác định xem có cần làm mới dữ liệu không
        boolean shouldForceRefresh = Boolean.TRUE.equals(force) || forceRefreshHeader != null;
        
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userService.searchUser(query, pageable);
        List<UserDto> userDtos = userDtoMapper.toUserDtos(userPage.getContent());

        // Inject thông tin về trạng thái follow và bạn bè
        userDtos.forEach(dto -> {
            User user = userPage.getContent().stream()
                .filter(u -> u.getId().equals(dto.getId()))
                .findFirst()
                .orElse(null);
            if (user != null) {
                // Kiểm tra follow
                dto.setFollowed(UserUtil.isFollowingByReqUser(reqUser, user));
                
                // Kiểm tra trạng thái bạn bè - Nếu cần force refresh thì truy vấn trực tiếp vào database
                try {
                    boolean isFriend;
                    if (shouldForceRefresh) {
                        // Bỏ qua cache, kiểm tra trực tiếp trong database
                        isFriend = reqUser.getFriends().contains(user) && user.getFriends().contains(reqUser);
                        logger.info("Force checking friendship directly: User {} and {} are friends: {}", 
                                   reqUser.getId(), user.getId(), isFriend);
                    } else {
                        // Sử dụng phương thức thông thường (có thể sử dụng cache)
                        isFriend = userService.isFriend(reqUser.getId(), user.getId());
                    }
                    
                    dto.setFriend(isFriend);
                    dto.setIsFriend(isFriend);
                    
                    if (!isFriend) {
                        // Kiểm tra xem đã gửi lời mời kết bạn chưa
                        boolean hasPendingRequest;
                        // Kiểm tra xem có lời mời kết bạn từ người này không
                        boolean hasReceivedRequest;
                        
                        if (shouldForceRefresh) {
                            // Kiểm tra trực tiếp
                            var sentRequest = friendRequestRepository.findBySenderAndReceiver(reqUser, user);
                            hasPendingRequest = sentRequest != null && 
                                              sentRequest.getStatus() == FriendRequest.Status.PENDING;
                                              
                            var receivedRequest = friendRequestRepository.findBySenderAndReceiver(user, reqUser);
                            hasReceivedRequest = receivedRequest != null && 
                                               receivedRequest.getStatus() == FriendRequest.Status.PENDING;
                                               
                            logger.info("Force checking friend requests - Sent: {}, Received: {}", 
                                      hasPendingRequest, hasReceivedRequest);
                        } else {
                            hasPendingRequest = userService.hasPendingFriendRequest(reqUser.getId(), user.getId());
                            hasReceivedRequest = userService.hasPendingFriendRequest(user.getId(), reqUser.getId());
                        }
                        
                        dto.setPendingFriendRequest(hasPendingRequest);
                        dto.setReceivedFriendRequest(hasReceivedRequest);
                    }
                } catch (Exception e) {
                    logger.error("Lỗi khi kiểm tra trạng thái bạn bè: " + e.getMessage(), e);
                }
            }
        });

        // Thiết lập header Cache-Control để tránh caching ở client
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        return new ResponseEntity<>(
                new PageImpl<>(userDtos, pageable, userPage.getTotalElements()),
                HttpStatus.OK
        );
    }

    @PutMapping("/{userId}/follow")
    public ResponseEntity<UserDto> followUser(
        @PathVariable Long userId, 
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) throws UserException {
        // Kiểm tra token
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.followUser(userId, reqUser);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        UserDto userDto = userDtoMapper.toUserDto(user);
        userDto.setFollowed(UserUtil.isFollowingByReqUser(reqUser, user));

        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }

    // Friend request endpoints
    @PostMapping("/friend-request/{receiverId}")
    public ResponseEntity<FriendRequest> sendFriendRequest(
        @PathVariable Long receiverId,
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User sender = userService.findUserProfileByJwt(token);
        if (sender == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        FriendRequest request = userService.sendFriendRequest(receiverId, sender);
        return new ResponseEntity<>(request, HttpStatus.OK);
    }

    @PutMapping("/friend-request/{requestId}/accept")
    public ResponseEntity<FriendRequest> acceptFriendRequest(
        @PathVariable Long requestId,
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User receiver = userService.findUserProfileByJwt(token);
        if (receiver == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        FriendRequest request = userService.acceptFriendRequest(requestId, receiver);
        return new ResponseEntity<>(request, HttpStatus.OK);
    }

    @DeleteMapping("/friend-request/{requestId}/reject")
    public ResponseEntity<Void> rejectFriendRequest(
        @PathVariable Long requestId,
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User receiver = userService.findUserProfileByJwt(token);
        if (receiver == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        userService.rejectFriendRequest(requestId, receiver);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/friend/{friendId}")
    public ResponseEntity<Void> removeFriend(
        @PathVariable Long friendId,
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.findUserProfileByJwt(token);
        if (user == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        userService.removeFriend(friendId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/friend-requests/pending")
    public ResponseEntity<List<FriendRequest>> getPendingFriendRequests(
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.findUserProfileByJwt(token);
        if (user == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<FriendRequest> requests = userService.getPendingFriendRequests(user);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }

    // Thêm phương thức để sửa lỗi quan hệ bạn bè
    @GetMapping("/fix-friendship/{userId}")
    public ResponseEntity<?> fixFriendship(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String jwt) {
        try {
            User reqUser = userService.findUserProfileByJwt(jwt);
            
            // Chỉ cho phép admin hoặc chính người dùng gọi API này
            if (!reqUser.getId().equals(userId) && reqUser.getEmail().equals("admin@example.com")) {
                return new ResponseEntity<>("Không được phép thực hiện hành động này", HttpStatus.FORBIDDEN);
            }
            
            if (userService instanceof UserServiceImpl) {
                ((UserServiceImpl) userService).fixFriendshipConsistency(reqUser.getId(), userId);
                return new ResponseEntity<>("Đã sửa lỗi quan hệ bạn bè", HttpStatus.OK);
            }
            
            return new ResponseEntity<>("Không thể thực hiện hành động này", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (UserException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getUserProfile(@RequestHeader("Authorization") String token) throws UserException {
        token = token.substring(7);
        User user = userService.findUserProfileByJwt(token);
        
        UserDto userDto = userDtoMapper.toUserDto(user);
        return new ResponseEntity<>(userDto, HttpStatus.ACCEPTED);
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId, @RequestHeader("Authorization") String token) 
            throws UserException {
        token = token.substring(7);
        
        User user = userService.findUserById(userId);
        UserDto userDto = userDtoMapper.toUserDto(user);
        
        return new ResponseEntity<>(userDto, HttpStatus.ACCEPTED);
    }

    @GetMapping("/search-auth")
    public ResponseEntity<Page<UserDto>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String token) throws UserException {
        
        token = token.substring(7);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userService.searchUser(query, pageable);
        
        // Chuyển đổi Page<User> thành Page<UserDto>
        List<UserDto> userDtos = userDtoMapper.toUserDtos(userPage.getContent());
        Page<UserDto> userDtoPage = new PageImpl<>(userDtos, pageable, userPage.getTotalElements());
        
        return new ResponseEntity<>(userDtoPage, HttpStatus.OK);
    }

    @PutMapping("/update-auth")
    public ResponseEntity<UserDto> updateUser(
            @RequestBody UserDto req,
            @RequestHeader("Authorization") String token) throws UserException {
            
        token = token.substring(7);
        User reqUser = userService.findUserProfileByJwt(token);
    
        User updatedUser = userService.updateUser(reqUser.getId(), req);
        UserDto userDto = userDtoMapper.toUserDto(updatedUser);
            
        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }

}