package com.aspira.backend.repository;

import com.aspira.backend.model.CHGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
 
public interface CHGroupMemberRepository extends JpaRepository<CHGroupMember, Long> {
    Optional<CHGroupMember> findByGroupIdAndUserUserId(Long groupId, Long userId);
    boolean existsByGroupIdAndUserUserId(Long groupId, Long userId);
} 