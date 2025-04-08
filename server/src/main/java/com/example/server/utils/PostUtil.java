package com.example.server.utils;

import com.example.server.models.Like;
import com.example.server.models.Post;
import com.example.server.models.User;

public class PostUtil {
    public static boolean isLikedByReqUser(User reqUser, Post post) {
        if (reqUser == null || post == null || post.getLikes() == null) {
            return false;
        }
        for (Like like : post.getLikes()) {
            if (like.getUser() != null && like.getUser().getId().equals(reqUser.getId())) {
                return true;
            }
        }
        return false;
    }

    // Phương thức bổ sung từ PostDtoMapper
    public static boolean isRepostedByReqUser(User reqUser, Post post) {
        if (reqUser == null || post == null || post.getRepostUsers() == null) {
            return false;
        }
        return post.getRepostUsers().stream()
            .anyMatch(user -> user.getId().equals(reqUser.getId()));
    }
}