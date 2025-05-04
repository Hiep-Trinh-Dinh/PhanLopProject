package com.example.server.mapper;

import com.example.server.dto.PostDto;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.utils.PostUtil;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PostDtoMapper {

    @Autowired
    private UserDtoMapper userDtoMapper;
    
    @Autowired
    private CommentDtoMapper commentDtoMapper;

    public PostDto toPostDto(Post post, User reqUser) {
        if (post == null) return null;
        
        // Kiểm tra trạng thái is_active, bỏ qua bài viết ẩn (is_active = true trong logic đảo ngược)
        if (Boolean.TRUE.equals(post.getIsActive())) {
            // Bỏ qua bài viết ẩn
            return null;
        }

        PostDto postDto = new PostDto();
        
        postDto.setId(post.getId());
        postDto.setContent(post.getContent());
        postDto.setCreatedAt(post.getCreatedAt());
        postDto.setUpdatedAt(post.getUpdatedAt());
        postDto.setPrivacy(post.getPrivacy().toString());
        postDto.setGroupId(post.getGroup() != null ? post.getGroup().getId() : null);
        
        if (post.getGroup() != null) {
            postDto.setGroupId(post.getGroup().getId());
            postDto.setGroupName(post.getGroup().getName());
        }
        
        postDto.setUser(userDtoMapper.toUserDto(post.getUser()));
        
        postDto.setMedia(post.getMedia() != null ? post.getMedia().stream()
            .map(media -> new PostDto.MediaDto(
                media.getMediaType().toString(),
                media.getMediaUrl()
            ))
            .collect(Collectors.toList()) : List.of());
        
        setInteractionData(postDto, post, reqUser);
        setCommentData(postDto, post, reqUser, false);
        
        return postDto;
    }

    public PostDto toPostDtoWithDetails(Post post, User reqUser) {
        if (post == null) return null;

        PostDto postDto = toPostDto(post, reqUser);
        setCommentData(postDto, post, reqUser, true);
        return postDto;
    }

    public List<PostDto> toPostDtos(List<Post> posts, User reqUser) {
        if (posts == null) return List.of();
        return posts.stream()
            .map(post -> toPostDto(post, reqUser))
            .filter(postDto -> postDto != null)
            .collect(Collectors.toList());
    }

    public List<PostDto> toPostDtosWithDetails(List<Post> posts, User reqUser) {
        if (posts == null) return List.of();
        return posts.stream()
            .map(post -> toPostDtoWithDetails(post, reqUser))
            .filter(postDto -> postDto != null)
            .collect(Collectors.toList());
    }

    private void setInteractionData(PostDto postDto, Post post, User reqUser) {
        postDto.setTotalLikes(post.getLikes() != null ? post.getLikes().size() : 0);
        postDto.setLiked(reqUser != null && PostUtil.isLikedByReqUser(reqUser, post));
        
        if (post.getRepostUsers() != null) {
            postDto.setTotalReposts(post.getRepostUsers().size());
            postDto.setReposted(reqUser != null && PostUtil.isRepostedByReqUser(reqUser, post));
            postDto.setRepostUserIds(post.getRepostUsers().stream()
                .map(User::getId)
                .collect(Collectors.toList()));
        } else {
            postDto.setTotalReposts(0);
            postDto.setReposted(false);
            postDto.setRepostUserIds(List.of());
        }
    }

    private void setCommentData(PostDto postDto, Post post, User reqUser, boolean includeComments) {
        postDto.setTotalComments(post.getComments() != null ? post.getComments().size() : 0);
        
        if (includeComments && post.getComments() != null) {
            postDto.setComments(commentDtoMapper.toCommentDtos(post.getComments(), reqUser));
        }
    }
}