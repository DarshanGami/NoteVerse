package com.noteverse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Collaborator {
    private String userId;
    private String email;
    private String name;
    /** READ or WRITE */
    private String permission;
}
