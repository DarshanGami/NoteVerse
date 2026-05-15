package com.noteverse.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("audit_logs")
public class AuditLog {

    @Id
    private String id;

    private String userId;

    private String action;

    private String resource;

    private String resourceId;

    private String details;

    private String ipAddress;

    @CreatedDate
    private LocalDateTime createdAt;
}
