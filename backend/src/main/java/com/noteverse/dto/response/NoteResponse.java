package com.noteverse.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.noteverse.dto.response.CollaboratorResponse;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {

    private String id;
    private String title;
    private String content;
    private String userId;
    private String folderId;
    private List<String> tags;

    @JsonProperty("isPinned")
    private boolean isPinned;

    @JsonProperty("isFavourite")
    private boolean isFavourite;

    @JsonProperty("isDeleted")
    private boolean isDeleted;

    private LocalDateTime deletedAt;

    @JsonProperty("isLocked")
    private boolean isLocked;

    private List<CollaboratorResponse> collaborators;
    private int version;
    private int viewCount;
    private int wordCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
