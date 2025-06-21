package com.aspira.backend.service;

import com.aspira.backend.dto.TaskCornerDTO;
import com.aspira.backend.model.TaskCorner;
import com.aspira.backend.model.User;
import com.aspira.backend.repository.TaskCornerRepository;
import com.aspira.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskCornerService {

    @Autowired
    private TaskCornerRepository taskCornerRepository;

    @Autowired
    private UserRepository userRepository;

    public TaskCornerDTO createTask(TaskCornerDTO taskDTO, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        TaskCorner task = new TaskCorner();
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setTopics(taskDTO.getTopics());
        task.setResources(taskDTO.getResources());
        task.setStartDate(taskDTO.getStartDate());
        task.setEndDate(taskDTO.getEndDate());
        task.setCreatedBy(user);

        TaskCorner savedTask = taskCornerRepository.save(task);
        return convertToDTO(savedTask);
    }

    public TaskCornerDTO updateTask(Long taskId, TaskCornerDTO taskDTO) {
        TaskCorner task = taskCornerRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setTopics(taskDTO.getTopics());
        task.setResources(taskDTO.getResources());
        task.setStartDate(taskDTO.getStartDate());
        task.setEndDate(taskDTO.getEndDate());

        TaskCorner updatedTask = taskCornerRepository.save(task);
        return convertToDTO(updatedTask);
    }

    public void deleteTask(Long taskId) {
        if (!taskCornerRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Task not found");
        }
        taskCornerRepository.deleteById(taskId);
    }

    public List<TaskCornerDTO> getAllTasksByUser(Long userId) {
        List<TaskCorner> tasks = taskCornerRepository.findByCreatedBy_UserId(userId);
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TaskCornerDTO getTaskById(Long taskId) {
        TaskCorner task = taskCornerRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        return convertToDTO(task);
    }

    private TaskCornerDTO convertToDTO(TaskCorner task) {
        TaskCornerDTO dto = new TaskCornerDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setTopics(task.getTopics());
        dto.setResources(task.getResources());
        dto.setStartDate(task.getStartDate());
        dto.setEndDate(task.getEndDate());
        dto.setCreatedBy(task.getCreatedBy().getUserId());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }
} 