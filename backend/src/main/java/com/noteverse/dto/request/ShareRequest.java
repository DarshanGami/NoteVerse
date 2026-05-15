package com.noteverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareRequest {

    private String noteId;

    @NotBlank(message = "Permission is required")
    @Pattern(regexp = "VIEW|EDIT", message = "Permission must be VIEW or EDIT")
    private String permission;

    private String expiresAt;
}
