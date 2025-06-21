package com.aspira.backend.repository;

import com.aspira.backend.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByPostPostId(Long postId); // Find all media by post ID
}
