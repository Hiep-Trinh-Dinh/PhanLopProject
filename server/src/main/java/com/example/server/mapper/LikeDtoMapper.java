package com.example.server.mapper;

import com.example.server.dto.LikeDto;
import com.example.server.dto.UserDto;
import com.example.server.models.Like;
import com.example.server.models.User;

import java.util.List;
import java.util.stream.Collectors;

public class LikeDtoMapper {
    
    public static LikeDto toLikeDto(Like like, User reqUser) {
        if (like == null) return null;

        UserDto user = UserDtoMapper.toUserDto(like.getUser());

        LikeDto likeDto = new LikeDto();
        likeDto.setId(like.getId());
        likeDto.setUser(user);
        // Thêm thông tin về đối tượng được thích (post hoặc comment)
        if (like.getPost() != null) {
            likeDto.setPostId(like.getPost().getId());
        } else if (like.getComment() != null) {
            likeDto.setCommentId(like.getComment().getId());
        }
        return likeDto;
    }

    public static List<LikeDto> toLikeDtos(List<Like> likes, User reqUser) {
        if (likes == null) return List.of();
        return likes.stream()
            .map(like -> toLikeDto(like, reqUser))
            .collect(Collectors.toList());
    }
}