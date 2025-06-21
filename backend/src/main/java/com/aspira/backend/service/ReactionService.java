package com.aspira.backend.service;

import com.aspira.backend.dto.ReactionDTO;
import com.aspira.backend.dto.NotificationDTO;
import com.aspira.backend.exception.ResourceNotFoundException;
import com.aspira.backend.exception.UnauthorizedException;
import com.aspira.backend.model.Post;
import com.aspira.backend.model.Reaction;
import com.aspira.backend.model.User;
import com.aspira.backend.repository.PostRepository;
import com.aspira.backend.repository.ReactionRepository;
import com.aspira.backend.repository.UserRepository;
import com.aspira.backend.model.ReactionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
 
    @Transactional
    public ReactionDTO createReaction(ReactionDTO reactionDTO) {
        Post post = postRepository.findById(reactionDTO.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + reactionDTO.getPostId()));

        User user = userRepository.findById(reactionDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + reactionDTO.getUserId()));

        Reaction reaction = new Reaction();
        reaction.setReactionType(ReactionType.valueOf(reactionDTO.getReactionType()));
        reaction.setPost(post);
        reaction.setUser(user);

        Reaction savedReaction = reactionRepository.save(reaction);
        // Create notification for the owner of the post
        if (!post.getUser().getUserId().equals(user.getUserId())) { // Avoid notifying self
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setUserId(post.getUser().getUserId());
            notificationDTO.setMessage(user.getUsername() + " liked your post.");
            notificationDTO.setPostId(post.getPostId());
            notificationService.createNotification(notificationDTO);
        }
        return convertToDTO(savedReaction);
    }

    public List<ReactionDTO> getReactionsByPostId(Long postId) {
        return reactionRepository.findAll().stream()
                .filter(reaction -> reaction.getPost().getPostId().equals(postId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


     @Transactional
    public ReactionDTO updateReaction(Long reactionId, Long userId, String newReactionType) {
        // Fetch the reaction by ID
        Reaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reaction not found with id: " + reactionId));

        // Check if the user is the creator of the reaction
        if (!reaction.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to update this reaction.");
        }

        // Update the reaction type
        reaction.setReactionType(ReactionType.valueOf(newReactionType));

        // Save and return the updated reaction
        Reaction updatedReaction = reactionRepository.save(reaction);
        return convertToDTO(updatedReaction);
    }

    @Transactional
    public void removeReaction(Long reactionId, Long userId) {
        // Fetch the reaction by ID
        Reaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reaction not found with id: " + reactionId));

        // Check if the user is the creator of the reaction
        if (!reaction.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to delete this reaction.");
        }

        // Delete the reaction from the database
        reactionRepository.deleteById(reactionId);
    }

    public Optional<Reaction> findByUserIdAndPostId(Long userId, Long postId) {
        return reactionRepository.findAll().stream()
            .filter(r -> r.getUser().getUserId().equals(userId) && r.getPost().getPostId().equals(postId))
            .findFirst();
    }

    private ReactionDTO convertToDTO(Reaction reaction) {
        ReactionDTO reactionDTO = new ReactionDTO();
        reactionDTO.setReactionId(reaction.getReactionId());
        reactionDTO.setReactionType(reaction.getReactionType().name());
        reactionDTO.setPostId(reaction.getPost().getPostId());
        reactionDTO.setUserId(reaction.getUser().getUserId());
        return reactionDTO;
    }
}
