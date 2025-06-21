package com.aspira.backend.service;

import com.aspira.backend.dto.MediaDTO;
import com.aspira.backend.exception.ResourceNotFoundException;
import com.aspira.backend.model.Media;
import com.aspira.backend.model.MediaType;
import com.aspira.backend.model.Post;
import com.aspira.backend.repository.MediaRepository;
import com.aspira.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final PostRepository postRepository;

    @Value("${media.upload-dir:uploads/}")
    private String uploadDir;

    @Transactional
    public MediaDTO uploadMedia(MultipartFile file, Long postId, String mediaType, Long userId) throws IOException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        // Authorization: Only the post owner can upload media
        if (!post.getUser().getUserId().equals(userId)) {
            throw new SecurityException("You are not authorized to upload media for this post.");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String fileName = System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        
        File destinationFile = new File(Paths.get(uploadDir, fileName).toString());
        destinationFile.getParentFile().mkdirs();
        file.transferTo(destinationFile);

        // Save media info in database
        Media media = new Media();
        media.setMediaUrl(fileName);
        media.setMediaType(MediaType.valueOf(mediaType));
        media.setPost(post);

        Media savedMedia = mediaRepository.save(media);
        return convertToDTO(savedMedia);
    }

    public List<MediaDTO> getMediaByPostId(Long postId) {
        List<Media> mediaList = mediaRepository.findByPostPostId(postId);
        return mediaList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMedia(Long mediaId, Long userId) throws IOException {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id: " + mediaId));

        // Authorization: Only the post owner can delete media
        if (!media.getPost().getUser().getUserId().equals(userId)) {
            throw new SecurityException("You are not authorized to delete this media.");
        }

        // Delete file from filesystem
        try {
            Path filePath = Paths.get(uploadDir, media.getMediaUrl()).normalize();
            // Ensure the path is within the intended upload directory to prevent path traversal
            if (!filePath.startsWith(Paths.get(uploadDir).normalize())) {
                throw new SecurityException("Attempted to access file outside of upload directory.");
            }
            Files.deleteIfExists(filePath);
            System.out.println("Successfully deleted media file: " + filePath.toString());
        } catch (IOException e) {
            System.err.println("Error deleting media file: " + media.getMediaUrl() + " - " + e.getMessage());
            // Decide if this error should prevent DB deletion. For now, we'll proceed.
        }

        mediaRepository.delete(media);
    }

    private MediaDTO convertToDTO(Media media) {
        MediaDTO dto = new MediaDTO();
        dto.setMediaId(media.getMediaId());
        
        System.out.println("MediaService.convertToDTO: Filename from DB (media.getMediaUrl()): " + media.getMediaUrl());
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/media/files/")
                .path(media.getMediaUrl())
                .toUriString();
        System.out.println("MediaService.convertToDTO: Constructed fileDownloadUri: " + fileDownloadUri);
        dto.setMediaUrl(fileDownloadUri);
        
        dto.setMediaType(media.getMediaType().name());
        dto.setPostId(media.getPost().getPostId());
        return dto;
    }
}

