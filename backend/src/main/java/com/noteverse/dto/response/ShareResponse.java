package com.noteverse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareResponse {

    private String id;
    private String token;
    private String shareUrl;
    private String permission;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private boolean isActive;
}
