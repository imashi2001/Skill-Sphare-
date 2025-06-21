package com.aspira.backend.repository;

import com.aspira.backend.model.SavedPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    List<SavedPost> findByUserUserId(Long userId); // Find all saved posts by a specific user
}
