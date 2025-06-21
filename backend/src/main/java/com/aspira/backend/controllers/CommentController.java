package com.aspira.backend.controllers;

import com.aspira.backend.dto.CommentDTO;
import com.aspira.backend.service.CommentService;
import com.aspira.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.aspira.backend.model.User;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    // Create a new comment
    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@RequestBody CommentDTO commentDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        commentDTO.setUserId(user.getUserId());
        CommentDTO createdComment = commentService.createComment(commentDTO);

        // Add HATEOAS links
        createdComment.add(linkTo(methodOn(CommentController.class)
                .getCommentsByPost(createdComment.getPostId()))
                .withRel("get-comments"));
        createdComment.add(linkTo(methodOn(CommentController.class)
                .updateComment(createdComment.getCommentId(), "updatedContent"))
                .withRel("update-comment"));
        createdComment.add(linkTo(methodOn(CommentController.class)
                .deleteComment(createdComment.getCommentId()))
                .withRel("delete-comment"));

        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    // Get all comments by a specific post ID
    @GetMapping("/post/{postId}")
    public ResponseEntity<CollectionModel<CommentDTO>> getCommentsByPost(@PathVariable Long postId) {
        List<CommentDTO> comments = commentService.getCommentsByPostId(postId);

        comments.forEach(comment -> {
            comment.add(linkTo(methodOn(CommentController.class)
                    .updateComment(comment.getCommentId(), "updatedContent"))
                    .withRel("update-comment"));
            comment.add(linkTo(methodOn(CommentController.class)
                    .deleteComment(comment.getCommentId()))
                    .withRel("delete-comment"));
        });

        CollectionModel<CommentDTO> model = CollectionModel.of(comments);
        model.add(linkTo(methodOn(CommentController.class).getCommentsByPost(postId)).withSelfRel());
        return ResponseEntity.ok(model);
    }

    // Delete a specific comment by ID (restricted to creator or post owner)
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        commentService.deleteComment(commentId, user.getUserId());
        return ResponseEntity.noContent().build();
    }

    // Update a specific comment (restricted to creator)
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long commentId,
            @RequestParam String updatedContent) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        CommentDTO updatedComment = commentService.updateComment(commentId, user.getUserId(), updatedContent);

        // Add HATEOAS links
        updatedComment.add(linkTo(methodOn(CommentController.class)
                .getCommentsByPost(updatedComment.getPostId()))
                .withRel("get-comments"));
        updatedComment.add(linkTo(methodOn(CommentController.class)
                .updateComment(updatedComment.getCommentId(), "updatedContent"))
                .withRel("update-comment"));
        updatedComment.add(linkTo(methodOn(CommentController.class)
                .deleteComment(updatedComment.getCommentId()))
                .withRel("delete-comment"));

        return ResponseEntity.ok(updatedComment);
    }
}
