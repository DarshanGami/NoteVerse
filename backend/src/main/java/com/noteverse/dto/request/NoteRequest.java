package com.noteverse.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteRequest {

    private String title;
    private String content;
    private String folderId;
    private List<String> tags;

    @Builder.Default
    private boolean isPinned = false;

    @Builder.Default
    private boolean isFavourite = false;
}
