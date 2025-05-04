package com.example.server.mapper;

import com.example.server.dto.LikeDto;
import com.example.server.models.Like;
import com.example.server.models.User;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class LikeDtoMapper {
    
    @Autowired
    private UserDtoMapper userDtoMapper;
    
    public LikeDto toLikeDto(Like like, User reqUser) {
        if (like == null) return null;

        LikeDto likeDto = new LikeDto();
        likeDto.setId(like.getId());
        likeDto.setUser(userDtoMapper.toUserDto(like.getUser()));
        
        if (like.getPost() != null) {
            likeDto.setPostId(like.getPost().getId());
        }
        if (like.getComment() != null) {
            likeDto.setCommentId(like.getComment().getId());
        }
        return likeDto;
    }

    public List<LikeDto> toLikeDtos(List<Like> likes, User reqUser) {
        if (likes == null) return List.of();
        return likes.stream()
            .map(like -> toLikeDto(like, reqUser))
            .collect(Collectors.toList());
    }
}