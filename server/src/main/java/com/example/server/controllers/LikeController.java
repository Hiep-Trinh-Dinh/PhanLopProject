package com.example.server.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.dto.LikeDto;
import com.example.server.exception.PostException;
import com.example.server.exception.UserException;
import com.example.server.mapper.LikeDtoMapper;
import com.example.server.models.Like;
import com.example.server.models.User;
import com.example.server.services.LikeService;
import com.example.server.services.UserService;

@RestController
@RequestMapping("/api")
public class LikeController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private LikeService likeService;

    @PostMapping("{twitId}/likes")
    public ResponseEntity<LikeDto> likeTwit(@PathVariable Long twitId, @RequestHeader("Authorization") String jwt) throws UserException, PostException {
        User user = userService.findUserProfileByJwt(jwt);
        Like like = likeService.likePost(user, twitId);

        LikeDto likeDto = LikeDtoMapper.toLikeDto(like, user);

        return new ResponseEntity<LikeDto>(likeDto, HttpStatus.CREATED);
    }

    @PostMapping("/twit/{twitId}")
    public ResponseEntity<List<LikeDto>> getAllLike(@PathVariable Long twitId, @RequestHeader("Authorization") String jwt) throws UserException, PostException {
        User user = userService.findUserProfileByJwt(jwt);
        List<Like> likes = likeService.getAllLikes(twitId);

        List<LikeDto> likeDtos = LikeDtoMapper.toLikeDtos(likes, user);

        return new ResponseEntity<>(likeDtos, HttpStatus.CREATED);
    }
}
