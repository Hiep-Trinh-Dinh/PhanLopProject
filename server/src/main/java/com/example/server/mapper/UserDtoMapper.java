package com.example.server.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.example.server.dto.UserDto;
import com.example.server.models.User;

public class UserDtoMapper {
    public static UserDto toUserDto(User user) {
        if (user == null) return null;

        UserDto userDto = mapToUserDto(user);
        userDto.setFollowers(toUserDtos(user.getFollowers()));
        userDto.setFollowing(toUserDtos(user.getFollowing()));
        userDto.setLogin_with_Google(user.getLogin_with_Google());
        userDto.setPhone(user.getPhone());
        userDto.setEmail(user.getEmail());

        return userDto;
    }

    public static List<UserDto> toUserDtos(List<User> users) {
        if (users == null) return List.of();

        return users.stream()
                    .map(UserDtoMapper::mapToUserDto)
                    .collect(Collectors.toList());
    }

    private static UserDto mapToUserDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setFullName(user.getFullName());
        userDto.setLocation(user.getLocation());
        userDto.setWebsite(user.getWebsite());
        userDto.setBio(user.getBio());
        userDto.setImage(user.getImage());
        userDto.setBackgroundImage(user.getBackgroundImage());
        userDto.setBirthDate(user.getBirthDate());
        return userDto;
    }
}
