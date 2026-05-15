package com.noteverse.controller;

import com.noteverse.dto.request.ShareRequest;
import com.noteverse.dto.response.ApiResponse;
import com.noteverse.dto.response.NoteResponse;
import com.noteverse.dto.response.ShareResponse;
import com.noteverse.service.ShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
@Tag(name = "Share", description = "Note sharing endpoints")
public class ShareController {

    private final ShareService shareService;

    @PostMapping("/{noteId}")
    @Operation(summary = "Create a share link for a note")
    public ResponseEntity<ApiResponse<ShareResponse>> createShareLink(
            Authentication authentication,
            @PathVariable String noteId,
            @Valid @RequestBody ShareRequest request) {
        ShareResponse shareResponse = shareService.createShareLink(noteId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Share link created successfully", shareResponse));
    }

    @GetMapping("/public/{token}")
    @Operation(summary = "Access a shared note by token (public, no auth required)")
    public ResponseEntity<ApiResponse<NoteResponse>> getSharedNote(@PathVariable String token) {
        NoteResponse note = shareService.getSharedNote(token);
        return ResponseEntity.ok(ApiResponse.success("Shared note retrieved successfully", note));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Revoke a share link")
    public ResponseEntity<ApiResponse<Void>> revokeShareLink(
            Authentication authentication,
            @PathVariable String id) {
        shareService.revokeLink(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.successMessage("Share link revoked successfully"));
    }
}
