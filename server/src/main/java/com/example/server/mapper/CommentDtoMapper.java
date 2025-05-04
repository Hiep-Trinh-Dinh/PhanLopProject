package com.example.server.mapper;

import com.example.server.dto.CommentDto;
import com.example.server.models.Comment;
import com.example.server.models.User;
import com.example.server.utils.CommentUtil;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CommentDtoMapper {

    @Autowired
    private UserDtoMapper userDtoMapper;

    // Chuyển đổi cơ bản Comment sang CommentDto (không bao gồm replies)
    public CommentDto toCommentDto(Comment comment, User reqUser) {
        if (comment == null) return null;

        CommentDto commentDto = new CommentDto();
        commentDto.setId(comment.getId());
        commentDto.setContent(comment.getContent());
        commentDto.setUser(userDtoMapper.toUserDto(comment.getUser()));
        commentDto.setCreatedAt(comment.getCreatedAt());
        commentDto.setUpdatedAt(comment.getUpdatedAt());
        commentDto.setLiked(CommentUtil.isLikedByReqUser(reqUser, comment));
        commentDto.setTotalLikes(comment.getLikes() != null ? comment.getLikes().size() : 0);
        commentDto.setReplyCount(comment.getReplies() != null ? comment.getReplies().size() : 0);
        
        if (comment.getParentComment() != null) {
            commentDto.setParentId(comment.getParentComment().getId());
        }
        
        return commentDto;
    }

    // Chuyển đổi Comment sang CommentDto bao gồm cả replies (đệ quy)
    public CommentDto toCommentDtoWithReplies(Comment comment, User reqUser) {
        CommentDto commentDto = toCommentDto(comment, reqUser);
        
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentDto> replies = comment.getReplies().stream()
                .map(reply -> toCommentDto(reply, reqUser))
                .collect(Collectors.toList());
            commentDto.setReplies(replies);
        }
        
        return commentDto;
    }

    // Chuyển đổi danh sách Comment
    public List<CommentDto> toCommentDtos(List<Comment> comments, User reqUser) {
        if (comments == null) return List.of();
        return comments.stream()
            .map(comment -> toCommentDto(comment, reqUser))
            .collect(Collectors.toList());
    }

    public List<CommentDto> toCommentDtosWithReplies(List<Comment> comments, User reqUser) {
        if (comments == null) return List.of();
        return comments.stream()
            .map(comment -> toCommentDtoWithReplies(comment, reqUser))
            .collect(Collectors.toList());
    }
}