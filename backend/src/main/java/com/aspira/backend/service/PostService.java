package com.aspira.backend.service;

import com.aspira.backend.dto.PostDTO;
import com.aspira.backend.dto.MediaDTO;
import com.aspira.backend.exception.ResourceNotFoundException;
import com.aspira.backend.exception.UnauthorizedException;
import com.aspira.backend.model.Hashtag;
import com.aspira.backend.model.Post;
import com.aspira.backend.model.User;
import com.aspira.backend.repository.HashtagRepository;
import com.aspira.backend.repository.PostRepository;
import com.aspira.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import jakarta.persistence.EntityManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service // Service annotation indicates that this class is a service component in the
         // Spring context
@RequiredArgsConstructor // Lombok annotation to generate a constructor with required arguments
// This class handles the business logic for managing posts, including creating,
// updating, deleting, and searching posts.
public class PostService {

    private final PostRepository postRepository;// Inject PostRepository for post management
    private final UserRepository userRepository;// Inject UserRepository for user management
    private final HashtagRepository hashtagRepository;// Inject HashtagRepository for hashtag management
    private final EntityManager entityManager; // Inject EntityManager for Hibernate Search
    private final MediaService mediaService; // Inject MediaService

    // Extract hashtags from the content using regex
    // This method uses regex to find hashtags in the content string.
    private Set<String> extractHashtags(String content) {
        Pattern pattern = Pattern.compile("#(\\w+)");
        Matcher matcher = pattern.matcher(content);
        Set<String> tags = new HashSet<>();
        while (matcher.find()) {
            tags.add(matcher.group(1).toLowerCase());
        }
        return tags;
    }

    @Transactional
    // create post
    public PostDTO createPost(Long userId, PostDTO postDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Set<String> tagNames = extractHashtags(postDTO.getContent());
        Set<Hashtag> hashtags = new HashSet<>();
        // hashtag repository find by name. if not found, create a new one and save it.
        // then add it to the post
        for (String tagName : tagNames) {
            Hashtag hashtag = hashtagRepository.findByName(tagName)
                    .orElseGet(() -> {
                        Hashtag newTag = new Hashtag(tagName);
                        return hashtagRepository.save(newTag);
                    });
            hashtags.add(hashtag);
        }
        Post post = new Post();
        post.setCategory(postDTO.getCategory());
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setUser(user);
        post.setHashtags(hashtags);

        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost);
    }

    // get all posts
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // get posts by category
    public List<PostDTO> getPostsByCategory(String category) {
        return postRepository.findByCategoryIgnoreCase(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // get posts for a specific user
    public List<PostDTO> getPostsByUserId(Long userId) {
        return postRepository.findByUserUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // get a post by it's ID
    public PostDTO getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        return convertToDTO(post);
    }

    @Transactional
    // Update createPost method to include hashtag extraction and saving
    public PostDTO updatePost(Long postId, Long userId, PostDTO postDTO) {
        // Fetch the existing post by ID
        Post existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        // Check if the requesting user is the creator of the post
        if (!existingPost.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to update this post.");
        }

        Set<String> tagNames = extractHashtags(postDTO.getContent());
        Set<Hashtag> hashtags = new HashSet<>();
        for (String tagName : tagNames) {
            Hashtag hashtag = hashtagRepository.findByName(tagName)
                    .orElseGet(() -> hashtagRepository.save(new Hashtag(tagName)));
            hashtags.add(hashtag);
        }
        // Assign the updated set of hashtags to the existing post
        existingPost.setHashtags(hashtags);

        // Update fields in the entity
        existingPost.setCategory(postDTO.getCategory());
        existingPost.setTitle(postDTO.getTitle());
        existingPost.setContent(postDTO.getContent());

        // Save changes to the database
        Post updatedPost = postRepository.save(existingPost);

        return convertToDTO(updatedPost);
    }

    // get posts by hashtag
    public List<PostDTO> searchByHashtag(String hashtag) {
        return postRepository.findByHashtag(hashtag.toLowerCase())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // delete a post if the user is authorized to delete the post
    @Transactional
    public void deletePost(Long postId, Long userId) {
        // Fetch the existing post by ID
        Post existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        // Check if the requesting user is the creator of the post
        if (!existingPost.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to delete this post.");
        }

        // Delete the post from the database
        postRepository.deleteById(postId);
    }

    // Calculate rank score for a single post
    public double calculateRankScore(Post post) {
        int reactionsCount = post.getReactions().size();
        int commentsCount = post.getComments().size();
        int viewsCount = post.getViews();

        // Time since creation in hours
        long hoursSinceCreation = Duration.between(post.getCreatedAt(), LocalDateTime.now()).toHours();

        // Apply ranking formula
        return ((reactionsCount * 2) + (commentsCount * 1.5) + viewsCount) / Math.pow((hoursSinceCreation + 2), 1.5);
    }

    // Update rank scores for all posts
    @Transactional
    public void updateRankScores() {
        List<Post> posts = postRepository.findAll();
        for (Post post : posts) {
            double rankScore = calculateRankScore(post);
            post.setRankScore(rankScore);
            postRepository.save(post);
        }
    }

    // Get ranked posts (sorted by rank score)
    public List<PostDTO> getRankedPosts() {
        return postRepository.findAll().stream()
                .sorted(Comparator.comparingDouble(Post::getRankScore).reversed()) // Sort by rankScore descending
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Helper method to convert Post entity to PostDTO
    private PostDTO convertToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setPostId(post.getPostId());
        dto.setCategory(post.getCategory());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUserId(post.getUser().getUserId());

        // Add author details
        if (post.getUser() != null) {
            dto.setAuthorName(post.getUser().getName());
            dto.setAuthorProfileImage(post.getUser().getProfileImage());
        } else {
            // Handle case where post might not have a user (though unlikely for your setup)
            dto.setAuthorName("Unknown Author");
            dto.setAuthorProfileImage(null); // Or a default placeholder path
        }

        dto.setViews(post.getViews());
        dto.setRankScore(post.getRankScore());

        List<MediaDTO> mediaList = mediaService.getMediaByPostId(post.getPostId());
        dto.setMediaList(mediaList);
        
        // Extract and set hashtags
        if (post.getHashtags() != null) {
            dto.setHashtags(post.getHashtags().stream().map(Hashtag::getName).collect(Collectors.toList()));
        }

        return dto;
    }

    // search posts by keyword in title and content
    public List<PostDTO> searchPosts(String keyword) {
        // Create a Hibernate Search session from the EntityManager
        SearchSession searchSession = Search.session(entityManager.unwrap(org.hibernate.Session.class));

        // Perform a full-text search on the Post entity's title and content fields
        List<Post> posts = searchSession.search(Post.class)
                .where(f -> f.match()
                        .fields("title", "content") // Specify searchable fields
                        .matching(keyword))
                .fetchHits(20); // Limit results to 20 posts

        return posts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PostDTO> getTopRankedPosts(int limit) {
        List<Post> topPosts = postRepository.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "rankScore"))).getContent();
        return topPosts.stream()
                       .map(this::convertToDTO)
                       .collect(Collectors.toList());
    }
}
