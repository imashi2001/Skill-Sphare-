package com.aspira.backend.repository;

import com.aspira.backend.model.CHGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CHGroupRepository extends JpaRepository<CHGroup, Long> {
    @Query("SELECT g FROM CHGroup g WHERE g.admin.userId = :adminId")
    List<CHGroup> findByAdminUserId(Long adminId);
    
    @Query("SELECT g FROM CHGroup g JOIN g.members m WHERE m.user.userId = :userId")
    List<CHGroup> findGroupsByMemberId(Long userId);
} 