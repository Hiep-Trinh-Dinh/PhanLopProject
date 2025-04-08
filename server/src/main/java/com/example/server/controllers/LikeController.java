package com.example.server.controllers;

import com.example.server.config.JwtProvider;
import com.example.server.dto.LikeDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.services.LikeService;
import com.example.server.services.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserService userService;

    @Value("${app.secure:true}")
    private boolean secureCookie;

    private static final String COOKIE_NAME = "auth_token";

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<LikeDto> likePost(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            LikeDto likeDto = likeService.likePost(postId, reqUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(likeDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/comment/{commentId}")
    public ResponseEntity<LikeDto> likeComment(
            @PathVariable Long commentId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            LikeDto likeDto = likeService.likeComment(commentId, reqUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(likeDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/post/{postId}")
    public ResponseEntity<Void> unlikePost(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            likeService.unlikePost(postId, reqUser.getId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<Void> unlikeComment(
            @PathVariable Long commentId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            likeService.unlikeComment(commentId, reqUser.getId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<LikeDto>> getLikesByPostId(
            @PathVariable Long postId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<LikeDto> likes = likeService.getLikesByPostId(postId, reqUser.getId());
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<List<LikeDto>> getLikesByCommentId(
            @PathVariable Long commentId,
            @CookieValue(name = COOKIE_NAME, required = false) String token,
            HttpServletResponse response) throws UserException {
        if (token == null || !jwtProvider.validateToken(token)) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User reqUser = userService.findUserProfileByJwt(token);
        if (reqUser == null) {
            clearJwtCookie(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<LikeDto> likes = likeService.getLikesByCommentId(commentId, reqUser.getId());
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}