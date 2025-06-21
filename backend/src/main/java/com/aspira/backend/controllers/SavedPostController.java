package com.aspira.backend.controllers;

import com.aspira.backend.dto.SavedPostDTO;
import com.aspira.backend.service.SavedPostService;
import com.aspira.backend.service.UserService;
import com.aspira.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/savedPosts")
@RequiredArgsConstructor
public class SavedPostController {

    private final SavedPostService savedPostService;
    private final UserService userService;

    // Get all saved posts for the authenticated user
    @GetMapping
    public ResponseEntity<List<SavedPostDTO>> getSavedPostsByUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        List<SavedPostDTO> savedPosts = savedPostService.getSavedPostsByUser(user.getUserId());
        return ResponseEntity.ok(savedPosts);
    }

    // Delete a specific saved post by ID (only by the owner)
    @DeleteMapping("/{savedPostId}")
    public ResponseEntity<Void> deleteSavedPosts(@PathVariable Long savedPostId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        savedPostService.deleteSavedPost(savedPostId, user.getUserId());
        return ResponseEntity.noContent().build();
    }

    // Create a new saved post (for the authenticated user)
    @PostMapping
    public ResponseEntity<SavedPostDTO> savePost(@RequestBody SavedPostDTO savedPostDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        savedPostDTO.setUserId(user.getUserId());
        SavedPostDTO createdSavedPost = savedPostService.savePost(savedPostDTO);
        return new ResponseEntity<>(createdSavedPost, HttpStatus.CREATED);
    }

    // Update the category of a saved post (only by the owner)
    @PutMapping("/{savedPostId}/category")
    public ResponseEntity<SavedPostDTO> updateSavedPostsCategory(
            @PathVariable Long savedPostId,
            @RequestParam String newCategory) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        SavedPostDTO updatedSavedPost = savedPostService.updateSavedPostCategory(savedPostId, newCategory, user.getUserId());
        return ResponseEntity.ok(updatedSavedPost);
    }
}
