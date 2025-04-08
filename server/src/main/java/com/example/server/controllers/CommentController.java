package com.example.server.controllers;

import com.example.server.config.JwtProvider;
import com.example.server.dto.CommentDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.services.CommentService;
import com.example.server.services.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

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
    public ResponseEntity<CommentDto> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentDto commentDto,
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
            CommentDto createdComment = commentService.createComment(commentDto, postId, reqUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/post/{postId}/reply/{parentCommentId}")
    public ResponseEntity<CommentDto> createReply(
            @PathVariable Long postId,
            @PathVariable Long parentCommentId,
            @Valid @RequestBody CommentDto commentDto,
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
            CommentDto createdReply = commentService.createReply(commentDto, postId, parentCommentId, reqUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReply);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<CommentDto> getCommentById(
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
            CommentDto commentDto = commentService.getCommentById(commentId, reqUser.getId());
            return ResponseEntity.ok(commentDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDto>> getCommentsByPostId(
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
            List<CommentDto> comments = commentService.getCommentsByPostId(postId, reqUser.getId());
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentDto commentDto,
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
            CommentDto updatedComment = commentService.updateComment(commentId, commentDto, reqUser.getId());
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
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
            commentService.deleteComment(commentId, reqUser.getId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{commentId}/like")
    public ResponseEntity<CommentDto> likeComment(
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
            CommentDto likedComment = commentService.likeComment(commentId, reqUser.getId());
            return ResponseEntity.ok(likedComment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{commentId}/unlike")
    public ResponseEntity<CommentDto> unlikeComment(
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
            CommentDto unlikedComment = commentService.unlikeComment(commentId, reqUser.getId());
            return ResponseEntity.ok(unlikedComment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}