package com.noteverse.controller;

import com.noteverse.dto.request.CollaborateRequest;
import com.noteverse.dto.response.ApiResponse;
import com.noteverse.dto.response.CollaboratorResponse;
import com.noteverse.service.CollaborateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collaborate")
@RequiredArgsConstructor
@Tag(name = "Collaboration", description = "Note collaboration endpoints")
public class CollaborateController {

    private final CollaborateService collaborateService;

    @PostMapping("/{noteId}/invite")
    @Operation(summary = "Invite a user to collaborate on a note (READ or WRITE)")
    public ResponseEntity<ApiResponse<CollaboratorResponse>> invite(
            Authentication authentication,
            @PathVariable String noteId,
            @Valid @RequestBody CollaborateRequest request) {
        CollaboratorResponse result = collaborateService.invite(noteId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Collaborator invited successfully", result));
    }

    @GetMapping("/{noteId}")
    @Operation(summary = "List all collaborators for a note")
    public ResponseEntity<ApiResponse<List<CollaboratorResponse>>> getCollaborators(
            Authentication authentication,
            @PathVariable String noteId) {
        List<CollaboratorResponse> collaborators = collaborateService.getCollaborators(noteId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Collaborators retrieved", collaborators));
    }

    @DeleteMapping("/{noteId}/{userId}")
    @Operation(summary = "Remove a collaborator from a note")
    public ResponseEntity<ApiResponse<Void>> removeCollaborator(
            Authentication authentication,
            @PathVariable String noteId,
            @PathVariable String userId) {
        collaborateService.removeCollaborator(noteId, userId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.successMessage("Collaborator removed successfully"));
    }
}
