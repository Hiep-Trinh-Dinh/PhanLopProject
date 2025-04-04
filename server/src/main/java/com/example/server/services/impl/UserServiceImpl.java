package com.example.server.services.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.server.config.JwtProvider;
import com.example.server.exception.UserException;
import com.example.server.models.User;
import com.example.server.repositories.UserRepository;
import com.example.server.services.UserService;

@Service
public class UserServiceImpl implements UserService{

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    @Override
    public User findUserById(Long userId) throws UserException {
        if (userId == null) {
            throw new UserException("User ID cannot be null");
        }
    
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found");
        }
        
        return user;
    }    

    @Override
    public User findUserProfileByJwt(String jwt) throws UserException {
        String email = jwtProvider.getEmailFromToken(jwt);

        User user = userRepository.findByEmail(email);
        if(user == null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;
    }

    @Override
    public User updateUser(Long userId, User req) throws UserException {
        User user = findUserById(userId);

        if(req.getFirstName() != null) {
            user.setFirstName(req.getFirstName());
        }

        if(req.getLastName() != null) {
            user.setLastName(req.getLastName());
        }

        if(req.getImage() != null) {
            user.setImage(req.getImage());
        }

        if(req.getBackgroundImage() != null) {
            user.setBackgroundImage(req.getBackgroundImage());
        }

        if(req.getBirthDate() != null) {
            user.setBirthDate(req.getBirthDate());
        }

        if(req.getLocation() != null) {
            user.setLocation(req.getLocation());
        }

        if(req.getBio() != null) {
            user.setBio(req.getBio());
        }

        if(req.getWebsite() != null) {
            user.setWebsite(req.getWebsite());
        }

        return userRepository.save(user);
    }

    @Override
    public User followUser(Long userId, User user) throws UserException {
        User followUser = findUserById(user.getId());
        if(user.getFollowing().contains(followUser)&& followUser.getFollowers().contains(user)){
            user.getFollowing().remove(followUser);
            followUser.getFollowers().remove(user);
        } else {
            user.getFollowing().add(followUser);
            followUser.getFollowers().add(user);
        }
        userRepository.save(user);
        userRepository.save(followUser);

        return followUser;
    }

    @Override
    public List<User> seacrhUser(String query) {
        return userRepository.searchUser(query);
    }
    
}
