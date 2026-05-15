package com.noteverse.controller;

import com.noteverse.dto.request.CommentRequest;
import com.noteverse.dto.response.ApiResponse;
import com.noteverse.dto.response.CommentResponse;
import com.noteverse.service.CommentService;
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
@RequestMapping("/api/comments/{noteId}")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Note comment management endpoints")
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    @Operation(summary = "Get all comments for a note")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable String noteId) {
        List<CommentResponse> comments = commentService.getComments(noteId);
        return ResponseEntity.ok(ApiResponse.success("Comments retrieved successfully", comments));
    }

    @PostMapping
    @Operation(summary = "Add a comment to a note")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            Authentication authentication,
            @PathVariable String noteId,
            @Valid @RequestBody CommentRequest request) {
        CommentResponse comment = commentService.addComment(noteId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", comment));
    }

    @PutMapping("/{commentId}")
    @Operation(summary = "Update a comment")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            Authentication authentication,
            @PathVariable String noteId,
            @PathVariable String commentId,
            @Valid @RequestBody CommentRequest request) {
        CommentResponse comment = commentService.updateComment(noteId, commentId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", comment));
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            Authentication authentication,
            @PathVariable String noteId,
            @PathVariable String commentId) {
        commentService.deleteComment(noteId, commentId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.successMessage("Comment deleted successfully"));
    }
}
