package com.example.server.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.server.dto.PostDto;
import com.example.server.exception.PostException;
import com.example.server.exception.UserException;
import com.example.server.mapper.PostDtoMapper;
import com.example.server.models.Post;
import com.example.server.models.User;
import com.example.server.responses.ApiResponse;
import com.example.server.services.PostService;
import com.example.server.services.UserService;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<PostDto> createPost(@RequestBody Post req, @RequestHeader("Authorization") String jwt) throws UserException, PostException {
        User user = userService.findUserProfileByJwt(jwt);

        Post post = postService.createPost(req, user);

        PostDto postDto = PostDtoMapper.toPostDto(post, user);

        return new ResponseEntity<>(postDto, HttpStatus.CREATED);
    }
    
    @PutMapping("/{postId}/reply")
    public ResponseEntity<PostDto> repost(@PathVariable Long postId, @RequestHeader("Authorization") String jwt) throws UserException, PostException {
        User user = userService.findUserProfileByJwt(jwt);

        Post post = postService.rePost(postId, user);

        PostDto postDto = PostDtoMapper.toPostDto(post, user);

        return new ResponseEntity<>(postDto, HttpStatus.OK);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> findPostById(@PathVariable Long postId, @RequestHeader("Authorization") String jwt) throws UserException, PostException {
        User user = userService.findUserProfileByJwt(jwt);

        Post post = postService.findById(postId);

        PostDto postDto = PostDtoMapper.toPostDto(post, user);

        return new ResponseEntity<>(postDto, HttpStatus.OK);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse> deletePost(@PathVariable Long postId, @RequestHeader("Authorization") String jwt) throws UserException, PostException {
        User user = userService.findUserProfileByJwt(jwt);

        postService.deletePostById(postId, user.getId());

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Post deleted successfully");
        apiResponse.setStatus(true);

        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    @GetMapping("/")
    public ResponseEntity<List<PostDto>> getAllPosts(@RequestHeader("Authorization") String jwt) throws UserException, PostException {
        User user = userService.findUserProfileByJwt(jwt);

        List<Post> posts = postService.findAllPosts();

        List<PostDto> postDtos = PostDtoMapper.toPostDtos(posts, user);

        return new ResponseEntity<>(postDtos, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDto>> getUsersAllPosts(@PathVariable Long userId ,@RequestHeader("Authorization") String jwt) throws UserException, PostException {
        User targetUser = userService.findUserById(userId); // Lấy user từ userId
        User currentUser = userService.findUserProfileByJwt(jwt); // Lấy user hiện tại từ JWT
    
        List<Post> posts = postService.getUserPosts(targetUser);
        List<PostDto> postDtos = PostDtoMapper.toPostDtos(posts, currentUser);
    
        return new ResponseEntity<>(postDtos, HttpStatus.OK);
    }    

    @GetMapping("/user/{userId}/likes")
    public ResponseEntity<List<PostDto>> findPostsLikedByUser(@PathVariable Long userId ,@RequestHeader("Authorization") String jwt) throws UserException, PostException {
        User targetUser = userService.findUserById(userId); // User từ userId
        User currentUser = userService.findUserProfileByJwt(jwt); // User hiện tại

        List<Post> posts = postService.getByLikesContainsUser(targetUser);
        List<PostDto> postDtos = PostDtoMapper.toPostDtos(posts, currentUser);

        return new ResponseEntity<>(postDtos, HttpStatus.OK);
    }
}
