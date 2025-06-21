package com.aspira.backend.controllers;

import com.aspira.backend.dto.ReactionDTO;
import com.aspira.backend.service.ReactionService;
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
@RequestMapping("/api/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ReactionDTO> createReaction(@RequestBody ReactionDTO reactionDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        reactionDTO.setUserId(user.getUserId());
        ReactionDTO createdReaction = reactionService.createReaction(reactionDTO);
        return new ResponseEntity<>(createdReaction, HttpStatus.CREATED);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<ReactionDTO>> getReactionsByPostId(@PathVariable Long postId) {
        List<ReactionDTO> reactions = reactionService.getReactionsByPostId(postId);
        return ResponseEntity.ok(reactions);
    }

    @PutMapping("/{reactionId}")
    public ResponseEntity<ReactionDTO> updateReaction(
            @PathVariable Long reactionId,
            @RequestParam String newReactionType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        ReactionDTO updatedReaction = reactionService.updateReaction(reactionId, user.getUserId(), newReactionType);
        return ResponseEntity.ok(updatedReaction);
    }

    @DeleteMapping("/{reactionId}")
    public ResponseEntity<Void> removeReaction(
            @PathVariable Long reactionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        reactionService.removeReaction(reactionId, user.getUserId());
        return ResponseEntity.noContent().build();
    }
}
