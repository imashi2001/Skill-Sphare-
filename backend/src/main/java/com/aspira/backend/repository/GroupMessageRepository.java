package com.aspira.backend.repository;

import com.aspira.backend.model.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    @Query("SELECT m FROM GroupMessage m WHERE m.group.id = :groupId ORDER BY m.sentAt ASC")
    List<GroupMessage> findMessagesByGroupId(Long groupId);
}
