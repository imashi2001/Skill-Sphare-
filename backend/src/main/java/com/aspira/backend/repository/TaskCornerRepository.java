package com.aspira.backend.repository;

import com.aspira.backend.model.TaskCorner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskCornerRepository extends JpaRepository<TaskCorner, Long> {
    List<TaskCorner> findByCreatedBy_UserId(Long userId);
} 