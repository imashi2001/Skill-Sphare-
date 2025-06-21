package com.aspira.backend.repository;

import com.aspira.backend.model.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
    Optional<Hashtag> findByName(String name);
}
