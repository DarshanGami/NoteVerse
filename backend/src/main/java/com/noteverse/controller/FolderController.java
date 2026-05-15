package com.noteverse.controller;

import com.noteverse.dto.request.FolderRequest;
import com.noteverse.dto.response.ApiResponse;
import com.noteverse.dto.response.FolderResponse;
import com.noteverse.service.FolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
@Tag(name = "Folders", description = "Folder management endpoints")
public class FolderController {

    private final FolderService folderService;

    @GetMapping
    @Operation(summary = "Get all folders for the current user")
    public ResponseEntity<ApiResponse<List<FolderResponse>>> getFolders(Authentication authentication) {
        List<FolderResponse> folders = folderService.getFolders(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Folders retrieved successfully", folders));
    }

    @PostMapping
    @Operation(summary = "Create a new folder")
    public ResponseEntity<ApiResponse<FolderResponse>> createFolder(
            Authentication authentication,
            @Valid @RequestBody FolderRequest request) {
        FolderResponse folder = folderService.createFolder(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Folder created successfully", folder));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a folder by ID")
    public ResponseEntity<ApiResponse<FolderResponse>> getFolderById(
            Authentication authentication,
            @PathVariable String id) {
        FolderResponse folder = folderService.getFolderById(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Folder retrieved successfully", folder));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a folder")
    public ResponseEntity<ApiResponse<FolderResponse>> updateFolder(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody FolderRequest request) {
        FolderResponse folder = folderService.updateFolder(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Folder updated successfully", folder));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a folder")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(
            Authentication authentication,
            @PathVariable String id) {
        folderService.deleteFolder(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.successMessage("Folder deleted successfully"));
    }
}
