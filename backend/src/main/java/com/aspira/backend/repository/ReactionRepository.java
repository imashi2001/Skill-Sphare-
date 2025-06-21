package com.aspira.backend.repository;

import com.aspira.backend.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    // Additional query methods can be added here if needed
}
