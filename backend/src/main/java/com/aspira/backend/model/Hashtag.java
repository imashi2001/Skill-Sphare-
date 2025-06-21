package com.aspira.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonValue;

import java.time.LocalDateTime;

@Entity
@Table(name = "hashtags")
@Data
@NoArgsConstructor
public class Hashtag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hashtagId;

    @Column(nullable = false, unique = true, length = 50)
    @JsonValue // This annotation is used to serialize the name field as the JSON value
    private String name;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // In Hashtag entity
    public String getName() {
        return name;
    }

    // Custom constructor for name-only creation
    public Hashtag(String name) {
        this.name = name.toLowerCase(); // Ensure lowercase consistency
    }
}
