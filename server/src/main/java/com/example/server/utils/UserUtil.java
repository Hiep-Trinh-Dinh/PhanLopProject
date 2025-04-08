package com.example.server.utils;

import com.example.server.models.User;

public class UserUtil {
    public static final boolean isReqUser(User reqUser, User user2){
        return reqUser.getId().equals(user2.getId());
    }

    public static final boolean isFollowingByReqUser(User reqUser, User user2){
        return reqUser.getFollowing().contains(user2);
    }

}
