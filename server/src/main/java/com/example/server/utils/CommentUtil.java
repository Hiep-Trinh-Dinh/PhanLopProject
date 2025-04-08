package com.example.server.utils;

import com.example.server.models.Comment;
import com.example.server.models.User;

public class CommentUtil {
    public static boolean isLikedByReqUser(User reqUser, Comment comment) {
        if (reqUser == null || comment == null || comment.getLikes() == null) {
            return false;
        }
        return comment.getLikes().stream()
            .anyMatch(like -> like.getUser() != null && like.getUser().getId().equals(reqUser.getId()));
    }
}