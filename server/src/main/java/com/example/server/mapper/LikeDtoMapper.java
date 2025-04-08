package com.example.server.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.example.server.dto.LikeDto;
import com.example.server.dto.PostDto;
import com.example.server.dto.UserDto;
import com.example.server.models.Like;
import com.example.server.models.User;

public class LikeDtoMapper {
    
    public static LikeDto toLikeDto(Like like, User reqUser) {
        if (like == null || reqUser == null) return null;

        UserDto user = UserDtoMapper.toUserDto(like.getUser());
        PostDto post = PostDtoMapper.toPostDto(like.getPost(), reqUser);

        LikeDto likeDto = new LikeDto();
        likeDto.setId(like.getId());
        likeDto.setUser(user);
        likeDto.setPost(post);
        return likeDto;
    }

    public static List<LikeDto> toLikeDtos(List<Like> likes, User reqUser) {
        if (likes == null || reqUser == null) return List.of();

        return likes.stream()
                    .map(like -> toLikeDto(like, reqUser))
                    .collect(Collectors.toList());
    }
}
