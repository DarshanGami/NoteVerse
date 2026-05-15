package com.noteverse.controller;

import com.noteverse.dto.response.ApiResponse;
import com.noteverse.dto.response.UserResponse;
import com.noteverse.model.AuditLog;
import com.noteverse.model.Session;
import com.noteverse.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "User settings and profile management endpoints")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication authentication) {
        UserResponse user = settingsService.getProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", user));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> updates) {
        UserResponse user = settingsService.updateProfile(authentication.getName(), updates);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));
    }

    @GetMapping("/sessions")
    @Operation(summary = "Get all active sessions for the current user")
    public ResponseEntity<ApiResponse<List<Session>>> getSessions(Authentication authentication) {
        List<Session> sessions = settingsService.getSessions(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Sessions retrieved successfully", sessions));
    }

    @DeleteMapping("/sessions/{sessionId}")
    @Operation(summary = "Revoke a specific session")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            Authentication authentication,
            @PathVariable String sessionId) {
        settingsService.revokeSession(sessionId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.successMessage("Session revoked successfully"));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs for the current user")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs(Authentication authentication) {
        List<AuditLog> logs = settingsService.getAuditLogs(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", logs));
    }
}
