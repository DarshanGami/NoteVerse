package com.noteverse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FolderResponse {

    private String id;
    private String name;
    private String userId;
    private String parentId;
    private List<String> children;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
