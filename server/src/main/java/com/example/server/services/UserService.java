package com.example.server.services;

import java.util.List;

import com.example.server.dto.UserDto;
import com.example.server.exception.UserException;
import com.example.server.models.User;

public interface UserService {

    public User findUserById(Long userId) throws UserException;

    public User findUserProfileByJwt(String jwt) throws UserException;

    public User updateUser(Long userId, UserDto dto) throws UserException;

    public User followUser(Long userId, User user) throws UserException;

    public List<User> seacrhUser(String query);
}
