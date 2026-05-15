package com.noteverse.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CollaborateRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Permission is required")
    @Pattern(regexp = "READ|WRITE", message = "Permission must be READ or WRITE")
    private String permission;
}
