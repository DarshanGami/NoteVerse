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
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private List<String> roles;
    private boolean isVerified;
    private boolean isTwoFactorEnabled;
    private String profilePicture;
    private LocalDateTime createdAt;
}
