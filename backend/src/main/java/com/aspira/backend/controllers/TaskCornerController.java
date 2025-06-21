package com.aspira.backend.controllers;

import com.aspira.backend.dto.TaskCornerDTO;
import com.aspira.backend.service.TaskCornerService;
import com.aspira.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskCornerController {

    @Autowired
    private TaskCornerService taskCornerService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<TaskCornerDTO> createTask(@RequestBody TaskCornerDTO taskDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Long userId = userService.getUserByEmail(email).getUserId();
        TaskCornerDTO createdTask = taskCornerService.createTask(taskDTO, userId);
        return ResponseEntity.ok(createdTask);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskCornerDTO> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskCornerDTO taskDTO) {
        TaskCornerDTO updatedTask = taskCornerService.updateTask(taskId, taskDTO);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskCornerService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<TaskCornerDTO>> getAllTasksByUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Long userId = userService.getUserByEmail(email).getUserId();
        List<TaskCornerDTO> tasks = taskCornerService.getAllTasksByUser(userId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskCornerDTO> getTaskById(@PathVariable Long taskId) {
        TaskCornerDTO task = taskCornerService.getTaskById(taskId);
        return ResponseEntity.ok(task);
    }
} 