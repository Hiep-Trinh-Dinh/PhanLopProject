package com.example.server.utils;

import com.example.server.models.Like;
import com.example.server.models.Post;
import com.example.server.models.User;

public class PostUtil {

    public final static boolean isLikedByReqUser(User reqUser, Post post) {
        for (Like like : post.getLikes()) {
            if (like.getUser().getId().equals(reqUser.getId())) {
                return true;
            }
        }
        return false;
    }

    public final static boolean isRepostedByReqUser(User reqUser, Post post) {
        for (User user : post.getRepostUsers()) {
            if (user.getId().equals(reqUser.getId())) {
                return true;
            }
        }
        return false;
    }
}
