package com.example.server.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.server.dto.FriendshipDto;
import com.example.server.dto.UserDto;
import com.example.server.models.Friendship;

@Component
public class FriendshipDtoMapper {

    @Autowired
    private UserDtoMapper userDtoMapper;

    public FriendshipDto toFriendshipDto(Friendship friendship) {
        if (friendship == null) return null;

        FriendshipDto dto = new FriendshipDto();
        dto.setId(friendship.getId());
        dto.setUser(userDtoMapper.toUserDto(friendship.getUser()));
        dto.setFriend(userDtoMapper.toUserDto(friendship.getFriend()));
        dto.setStatus(friendship.getStatus().toString());
        dto.setMutualFriendsCount(friendship.getMutualFriendsCount());
        dto.setCreatedAt(friendship.getCreatedAt());
        dto.setUpdatedAt(friendship.getUpdatedAt());

        return dto;
    }

    public List<FriendshipDto> toFriendshipDtos(List<Friendship> friendships) {
        if (friendships == null) return List.of();
        
        return friendships.stream()
                .map(this::toFriendshipDto)
                .collect(Collectors.toList());
    }

    public List<UserDto> toUserDtosFromFriendships(List<Friendship> friendships, boolean isUserField) {
        if (friendships == null) return List.of();
        
        return friendships.stream()
                .map(friendship -> isUserField ? 
                        userDtoMapper.toUserDto(friendship.getFriend()) : 
                        userDtoMapper.toUserDto(friendship.getUser()))
                .collect(Collectors.toList());
    }
} 