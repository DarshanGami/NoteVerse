package com.noteverse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("notes")
public class Note {

    @Id
    private String id;

    private String title;

    private String content;

    private String userId;

    private String folderId;

    private List<String> tags;

    @Builder.Default
    private boolean isPinned = false;

    @Builder.Default
    private boolean isFavourite = false;

    @Builder.Default
    private boolean isDeleted = false;

    private LocalDateTime deletedAt;

    @Builder.Default
    private boolean isLocked = false;

    private String lockPasswordHash;

    @Builder.Default
    private List<Collaborator> collaborators = new ArrayList<>();

    @Builder.Default
    private int version = 1;

    @Builder.Default
    private int viewCount = 0;

    @Builder.Default
    private int wordCount = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
