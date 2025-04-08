package com.example.server.mapper;

import com.example.server.dto.PostDto;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.utils.PostUtil;

import java.util.List;
import java.util.stream.Collectors;

public class PostDtoMapper {

    public static PostDto toPostDto(Post post, User reqUser) {
        if (post == null) return null;

        PostDto postDto = new PostDto();
        
        postDto.setId(post.getId());
        postDto.setContent(post.getContent());
        postDto.setCreatedAt(post.getCreatedAt());
        postDto.setUpdatedAt(post.getUpdatedAt());
        postDto.setPrivacy(post.getPrivacy().toString());
        
        postDto.setUser(UserDtoMapper.toUserDto(post.getUser()));
        
        postDto.setMedia(post.getMedia() != null ? post.getMedia().stream()
            .map(media -> new PostDto.MediaDto(
                media.getMediaType().toString(),
                media.getUrl()
            ))
            .collect(Collectors.toList()) : List.of());
        
        setInteractionData(postDto, post, reqUser);
        setCommentData(postDto, post, reqUser, false);
        
        return postDto;
    }

    public static PostDto toPostDtoWithDetails(Post post, User reqUser) {
        if (post == null) return null;

        PostDto postDto = toPostDto(post, reqUser);
        setCommentData(postDto, post, reqUser, true);
        return postDto;
    }

    public static List<PostDto> toPostDtos(List<Post> posts, User reqUser) {
        if (posts == null) return List.of();
        return posts.stream()
            .map(post -> toPostDto(post, reqUser))
            .collect(Collectors.toList());
    }

    public static List<PostDto> toPostDtosWithDetails(List<Post> posts, User reqUser) {
        if (posts == null) return List.of();
        return posts.stream()
            .map(post -> toPostDtoWithDetails(post, reqUser))
            .collect(Collectors.toList());
    }

    private static void setInteractionData(PostDto postDto, Post post, User reqUser) {
        postDto.setTotalLikes(post.getLikes() != null ? post.getLikes().size() : 0);
        postDto.setLiked(PostUtil.isLikedByReqUser(reqUser, post));
        
        // Thêm thông tin repost
        if (post.getRepostUsers() != null) {
            postDto.setTotalReposts(post.getRepostUsers().size());
            postDto.setReposted(PostUtil.isRepostedByReqUser(reqUser, post));
            postDto.setRepostUserIds(post.getRepostUsers().stream()
                .map(User::getId)
                .collect(Collectors.toList()));
        } else {
            postDto.setTotalReposts(0);
            postDto.setReposted(false);
            postDto.setRepostUserIds(List.of());
        }
    }

    private static void setCommentData(PostDto postDto, Post post, User reqUser, boolean includeDetails) {
        long commentCount = post.getComments() != null ? post.getComments().stream()
            .filter(comment -> comment.getParentComment() == null)
            .count() : 0;
        postDto.setTotalComments(commentCount);
        
        if (post.getComments() != null) {
            if (!includeDetails) {
                postDto.setPreviewComments(post.getComments().stream()
                    .filter(comment -> comment.getParentComment() == null)
                    .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                    .limit(2)
                    .map(comment -> CommentDtoMapper.toCommentDto(comment, reqUser))
                    .collect(Collectors.toList()));
            } else {
                postDto.setComments(post.getComments().stream()
                    .filter(comment -> comment.getParentComment() == null)
                    .map(comment -> CommentDtoMapper.toCommentDtoWithReplies(comment, reqUser))
                    .collect(Collectors.toList()));
            }
        } else {
            postDto.setPreviewComments(List.of());
            postDto.setComments(List.of());
        }
    }
}