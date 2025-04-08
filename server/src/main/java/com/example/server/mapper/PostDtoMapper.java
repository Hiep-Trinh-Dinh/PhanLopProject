package com.example.server.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.example.server.dto.PostDto;
import com.example.server.dto.UserDto;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.utils.PostUtil;

public class PostDtoMapper {
    public static PostDto toPostDto(Post post, User reqUser) {
        return mapToPostDto(post, reqUser, true);
    }

    private static PostDto mapToPostDto(Post post, User reqUser, boolean includeReplies) {
        UserDto user = UserDtoMapper.toUserDto(post.getUser());

        boolean isLiked = PostUtil.isLikedByReqUser(reqUser, post);
        boolean isReposted = PostUtil.isRepostedByReqUser(reqUser, post);

        List<Long> repostUserIds = post.getRepostUsers().stream()
                                      .map(User::getId)
                                      .collect(Collectors.toList());

        PostDto postDto = new PostDto();
        postDto.setId(post.getId());
        postDto.setUser(user);
        postDto.setContent(post.getContent());
        postDto.setCreatedAt(post.getCreatedAt());
        postDto.setImage(post.getImage());
        postDto.setTotalLikes(post.getLikes().size());
        postDto.setTotalReposts(post.getRepostUsers().size());
        postDto.setLiked(isLiked);
        postDto.setRepost(isReposted);
        postDto.setRepostUserIds(repostUserIds);
        postDto.setVideo(post.getVideo());

        if (includeReplies) {
            postDto.setReplyPosts(toPostDtos(post.getReplyPosts(), reqUser));
        }

        return postDto;
    }

    public static List<PostDto> toPostDtos(List<Post> posts, User reqUser) {
        return posts.stream()
                    .map(post -> mapToPostDto(post, reqUser, false))
                    .collect(Collectors.toList());
    }
}
