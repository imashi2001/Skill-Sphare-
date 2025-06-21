package com.aspira.backend.controllers;

import com.aspira.backend.dto.PostDTO;
import com.aspira.backend.service.PostService;
import com.aspira.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.aspira.backend.model.User;

import java.util.List;

@RestController // Indicates that this class is a REST controller
@RequestMapping("/api/posts") // Base URL for all endpoints in this controller
public class PostController {

    private final PostService postService;
    private final UserService userService;

    // Constructor injection for PostService and UserService
    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    // Create a new post
    @PostMapping
    public ResponseEntity<PostDTO> createPost(@Valid @RequestBody PostDTO postDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        PostDTO createdPost = postService.createPost(user.getUserId(), postDTO);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    // Search posts by keyword (title or content)
    @GetMapping("/search")
    public ResponseEntity<List<PostDTO>> searchPosts(@RequestParam String keyword) {
        List<PostDTO> posts = postService.searchPosts(keyword);
        return ResponseEntity.ok(posts);
    }

    // Get all posts
    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        List<PostDTO> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    // Get posts by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUserId(@PathVariable Long userId) {
        List<PostDTO> posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    // Get a post by ID
    @GetMapping("/{postId}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long postId) {
        PostDTO postDTO = postService.getPostById(postId);
        return ResponseEntity.ok(postDTO);
    }

    // Get posts by hashtag (case-insensitive)
    @GetMapping("/search/hashtag")
    public ResponseEntity<List<PostDTO>> searchByHashtag(
            @RequestParam String hashtag) {
        return ResponseEntity.ok(
                postService.searchByHashtag(hashtag));
    }

    // Get posts by category (case-insensitive)
    @GetMapping("/category/{category}")
    public ResponseEntity<List<PostDTO>> getPostsByCategory(@PathVariable String category) {
        List<PostDTO> posts = postService.getPostsByCategory(category);
        return ResponseEntity.ok(posts);
    }

    // Update a post
    @PutMapping("/{postId}")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PostDTO postDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        PostDTO updatedPost = postService.updatePost(postId, user.getUserId(), postDTO);
        return ResponseEntity.ok(updatedPost);
    }

    // Delete a post
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        postService.deletePost(postId, user.getUserId());
        return ResponseEntity.noContent().build();
    }

    // Get ranked posts (sorted by rank score)
    @GetMapping("/rank")
    public ResponseEntity<List<PostDTO>> getRankedPosts() {
        List<PostDTO> rankedPosts = postService.getRankedPosts();
        return ResponseEntity.ok(rankedPosts);
    }

    @GetMapping("/top-ranked")
    public ResponseEntity<List<PostDTO>> getTopRankedPosts(@RequestParam(defaultValue = "10") int limit) {
        List<PostDTO> topPosts = postService.getTopRankedPosts(limit);
        return ResponseEntity.ok(topPosts);
    }
}
