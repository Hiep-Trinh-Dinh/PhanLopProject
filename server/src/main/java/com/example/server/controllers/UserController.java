package com.example.server.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.config.JwtProvider;
import com.example.server.dto.UserDto;
import com.example.server.exception.UserException;
import com.example.server.mapper.UserDtoMapper;
import com.example.server.models.User;
import com.example.server.services.UserService;
import com.example.server.utils.UserUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private JwtProvider jwtProvider;

    @Value("${app.secure:true}")
    private boolean secureCookie;

    private static final String COOKIE_NAME = "auth_token"; // Đảm bảo khớp với CookieTokenValidator và AuthController

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict"); // Tăng bảo mật CSRF
        response.addCookie(cookie);
    }

    @PutMapping("/update")
    public ResponseEntity<UserDto> updateUser(
        @Valid @RequestBody UserDto req,
        @CookieValue(name = COOKIE_NAME, required = false) String token,
        HttpServletResponse response
    ) {
        try {
            // Kiểm tra token từ cookie
            if (token == null || !jwtProvider.validateToken(token)) {
                clearJwtCookie(response);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Lấy thông tin user từ token
            User reqUser = userService.findUserProfileByJwt(token);
            if (reqUser == null) {
                clearJwtCookie(response);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // Cập nhật thông tin user
            User updatedUser = userService.updateUser(reqUser.getId(), req);
            UserDto userDto = UserDtoMapper.toUserDto(updatedUser);

            return ResponseEntity.ok(userDto);
            
        } catch (UserException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
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

        UserDto userDto = UserDtoMapper.toUserDto(user);
        userDto.setIsRequestingUser(UserUtil.isReqUser(reqUser, user));
        userDto.setFollowed(UserUtil.isFollwingByReqUser(reqUser, user));

        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUser(
        @RequestParam String query, 
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

        List<User> users = userService.seacrhUser(query); // Sửa typo: "seacrhUser" -> "searchUser"
        List<UserDto> userDtos = UserDtoMapper.toUserDtos(users);

        // Đánh dấu các user đã follow bởi reqUser
        userDtos.forEach(dto -> {
            User user = users.stream()
                .filter(u -> u.getId().equals(dto.getId()))
                .findFirst()
                .orElse(null);
            if (user != null) {
                dto.setFollowed(UserUtil.isFollwingByReqUser(reqUser, user));
            }
        });

        return new ResponseEntity<>(userDtos, HttpStatus.OK);
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

        UserDto userDto = UserDtoMapper.toUserDto(user);
        userDto.setFollowed(UserUtil.isFollwingByReqUser(reqUser, user));

        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }
}