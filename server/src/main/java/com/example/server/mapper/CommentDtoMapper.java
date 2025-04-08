package com.example.server.mapper;

import com.example.server.dto.CommentDto;
import com.example.server.models.Comment;
import com.example.server.models.User;
import com.example.server.utils.CommentUtil;

import java.util.List;
import java.util.stream.Collectors;

public class CommentDtoMapper {

    // Chuyển đổi cơ bản Comment sang CommentDto (không bao gồm replies)
    public static CommentDto toCommentDto(Comment comment, User reqUser) {
        if (comment == null) return null;

        CommentDto commentDto = new CommentDto();
        commentDto.setId(comment.getId());
        commentDto.setContent(comment.getContent());
        commentDto.setCreatedAt(comment.getCreatedAt());
        commentDto.setUpdatedAt(comment.getUpdatedAt());
        
        // Thông tin người dùng
        commentDto.setUser(UserDtoMapper.toUserDto(comment.getUser()));
        
        // Media
        commentDto.setMedia(comment.getMedia() != null ? comment.getMedia().stream()
            .map(media -> new CommentDto.MediaDto(
                media.getMediaType().toString(),
                media.getUrl()
            ))
            .collect(Collectors.toList()) : List.of());
        
        // Thông tin like
        commentDto.setTotalLikes(comment.getLikes() != null ? comment.getLikes().size() : 0);
        commentDto.setLiked(CommentUtil.isLikedByReqUser(reqUser, comment));
        
        // Số lượng phản hồi
        commentDto.setReplyCount(comment.getReplies() != null ? (long) comment.getReplies().size() : 0L);
        
        return commentDto;
    }

    // Chuyển đổi Comment sang CommentDto bao gồm cả replies (đệ quy)
    public static CommentDto toCommentDtoWithReplies(Comment comment, User reqUser) {
        if (comment == null) return null;

        CommentDto commentDto = toCommentDto(comment, reqUser);
        
        // Thêm danh sách phản hồi (đệ quy)
        commentDto.setReplies(comment.getReplies() != null ? comment.getReplies().stream()
            .map(reply -> toCommentDtoWithReplies(reply, reqUser))
            .collect(Collectors.toList()) : List.of());
            
        return commentDto;
    }

    // Chuyển đổi danh sách Comment
    public static List<CommentDto> toCommentDtos(List<Comment> comments, User reqUser) {
        if (comments == null) return List.of();
        return comments.stream()
            .map(comment -> toCommentDto(comment, reqUser))
            .collect(Collectors.toList());
    }
}