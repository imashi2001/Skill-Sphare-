package com.aspira.backend.repository;

import com.aspira.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserUserId(Long userId); // Get posts by user ID

    List<Post> findByCategoryIgnoreCase(String category); // Find posts by category (case-insensitive)

    @Query("SELECT p FROM Post p JOIN p.hashtags h WHERE h.name = :hashtag")
    List<Post> findByHashtag(@Param("hashtag") String hashtag);

}


