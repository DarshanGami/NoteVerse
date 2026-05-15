package com.noteverse.controller;

import com.noteverse.dto.request.TagRequest;
import com.noteverse.dto.response.ApiResponse;
import com.noteverse.dto.response.TagResponse;
import com.noteverse.service.TagService;
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
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tags", description = "Tag management endpoints")
public class TagController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Get all tags for the current user")
    public ResponseEntity<ApiResponse<List<TagResponse>>> getTags(Authentication authentication) {
        List<TagResponse> tags = tagService.getTags(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Tags retrieved successfully", tags));
    }

    @PostMapping
    @Operation(summary = "Create a new tag")
    public ResponseEntity<ApiResponse<TagResponse>> createTag(
            Authentication authentication,
            @Valid @RequestBody TagRequest request) {
        TagResponse tag = tagService.createTag(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tag created successfully", tag));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a tag")
    public ResponseEntity<ApiResponse<TagResponse>> updateTag(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody TagRequest request) {
        TagResponse tag = tagService.updateTag(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Tag updated successfully", tag));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a tag")
    public ResponseEntity<ApiResponse<Void>> deleteTag(
            Authentication authentication,
            @PathVariable String id) {
        tagService.deleteTag(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.successMessage("Tag deleted successfully"));
    }
}
