package com.aspira.backend.service;

import com.aspira.backend.dto.CommentDTO;
import com.aspira.backend.dto.NotificationDTO;
import com.aspira.backend.exception.ResourceNotFoundException;
import com.aspira.backend.exception.UnauthorizedException;
import com.aspira.backend.model.Comment;
import com.aspira.backend.model.Post;
import com.aspira.backend.model.User;
import com.aspira.backend.repository.CommentRepository;
import com.aspira.backend.repository.PostRepository;
import com.aspira.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public CommentDTO createComment(CommentDTO commentDTO) {
        Post post = postRepository.findById(commentDTO.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + commentDTO.getPostId()));

        User user = userRepository.findById(commentDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + commentDTO.getUserId()));

        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setPost(post);
        comment.setUser(user);

        Comment savedComment = commentRepository.save(comment);
        // Create notification for the owner of the post
        if (!post.getUser().getUserId().equals(user.getUserId())) { // Avoid notifying self
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setUserId(post.getUser().getUserId());
            notificationDTO.setMessage(user.getUsername() + " has commented on your post.");
            notificationDTO.setPostId(post.getPostId());
            notificationDTO.setCommentId(savedComment.getCommentId());
            notificationService.createNotification(notificationDTO);
        }
        return convertToDTO(savedComment);
    }

    public List<CommentDTO> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostPostId(postId);
        return comments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        // Fetch the comment by ID
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        // Fetch the post and user associated with the comment
        Post post = comment.getPost();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if the user is either the creator of the comment or the owner of the post
        if (!comment.getUser().getUserId().equals(user.getUserId()) && !post.getUser().getUserId().equals(user.getUserId())) {
            throw new UnauthorizedException("You are not authorized to delete this comment.");
        }

        // Delete the comment
        commentRepository.deleteById(commentId);

        // Create notification for the owner of the post
        if (!post.getUser().getUserId().equals(userId)) { // Avoid notifying self
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setUserId(post.getUser().getUserId());
            notificationDTO.setMessage(comment.getUser().getUsername() + " has deleted their comment on your post.");
            notificationService.createNotification(notificationDTO);
        }
    }

    @Transactional
    public CommentDTO updateComment(Long commentId, Long userId, String updatedContent) {
        // Fetch the existing comment by ID
        Comment existingComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        // Check if the user is the creator of the comment
        if (!existingComment.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to update this comment.");
        }

        // Update the content of the comment
        existingComment.setContent(updatedContent);

        // Save changes to the database
        Comment updatedComment = commentRepository.save(existingComment);

        // Convert Entity to DTO and return
        return convertToDTO(updatedComment);
    }


    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setCommentId(comment.getCommentId());
        dto.setContent(comment.getContent());
        dto.setPostId(comment.getPost().getPostId());
        dto.setUserId(comment.getUser().getUserId());
        
        // Ensure these lines are present and correct
        dto.setCommenterUsername(comment.getUser().getUsername()); // Assumes User model has getUsername()
        dto.setCommenterAvatarUrl(comment.getUser().getProfileImage()); // Assumes User model has getProfileImage()
        
        dto.setCreatedAt(comment.getCreatedAt().format(formatter));
        dto.setUpdatedAt(comment.getUpdatedAt() != null ? comment.getUpdatedAt().format(formatter) : null);
        // Add HATEOAS links if you are still using them directly on DTO from here
        // It seems your controller is adding them now, which is fine.
        return dto;
    }
}
