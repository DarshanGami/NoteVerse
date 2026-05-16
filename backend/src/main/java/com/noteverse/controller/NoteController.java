package com.noteverse.controller;

import com.noteverse.dto.request.NoteRequest;
import com.noteverse.dto.response.ApiResponse;
import com.noteverse.dto.response.NoteResponse;
import com.noteverse.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Tag(name = "Notes", description = "Note management endpoints")
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    @Operation(summary = "Get paginated list of notes")
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> getNotes(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(required = false) String folderId,
            @RequestParam(required = false) Boolean isPinned,
            @RequestParam(required = false) Boolean isFavourite,
            @RequestParam(required = false) String tagId,
            @RequestParam(required = false) String search) {

        String userId = getUserId(authentication);

        if (search != null && !search.isBlank()) {
            List<NoteResponse> results = noteService.searchNotes(userId, search);
            return ResponseEntity.ok(ApiResponse.success("Search results", convertListToPage(results, page, size)));
        }

        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        Page<NoteResponse> notes = noteService.getNotes(userId, pageable, folderId, isPinned, isFavourite, tagId);
        return ResponseEntity.ok(ApiResponse.success("Notes retrieved successfully", notes));
    }

    @PostMapping
    @Operation(summary = "Create a new note")
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            Authentication authentication,
            @RequestBody NoteRequest request) {
        String userId = getUserId(authentication);
        NoteResponse note = noteService.createNote(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Note created successfully", note));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a note by ID")
    public ResponseEntity<ApiResponse<NoteResponse>> getNoteById(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        NoteResponse note = noteService.getNoteById(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Note retrieved successfully", note));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a note")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody NoteRequest request) {
        String userId = getUserId(authentication);
        NoteResponse note = noteService.updateNote(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Note updated successfully", note));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a note (move to trash)")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        noteService.softDelete(id, userId);
        return ResponseEntity.ok(ApiResponse.successMessage("Note moved to trash"));
    }

    @DeleteMapping("/{id}/permanent")
    @Operation(summary = "Permanently delete a note")
    public ResponseEntity<ApiResponse<Void>> permanentDeleteNote(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        noteService.hardDelete(id, userId);
        return ResponseEntity.ok(ApiResponse.successMessage("Note permanently deleted"));
    }

    @PutMapping("/{id}/restore")
    @Operation(summary = "Restore a note from trash")
    public ResponseEntity<ApiResponse<NoteResponse>> restoreNote(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        NoteResponse note = noteService.restore(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Note restored successfully", note));
    }

    @PutMapping("/{id}/pin")
    @Operation(summary = "Toggle pin status of a note")
    public ResponseEntity<ApiResponse<NoteResponse>> togglePin(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        NoteResponse note = noteService.togglePin(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Note pin status updated", note));
    }

    @PutMapping("/{id}/favourite")
    @Operation(summary = "Toggle favourite status of a note")
    public ResponseEntity<ApiResponse<NoteResponse>> toggleFavourite(
            Authentication authentication,
            @PathVariable String id) {
        String userId = getUserId(authentication);
        NoteResponse note = noteService.toggleFavourite(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Note favourite status updated", note));
    }

    @PostMapping("/{id}/lock")
    @Operation(summary = "Lock a note with a password")
    public ResponseEntity<ApiResponse<NoteResponse>> lockNote(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        String userId = getUserId(authentication);
        String password = request.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password is required to lock a note"));
        }
        NoteResponse note = noteService.lockNote(id, userId, password);
        return ResponseEntity.ok(ApiResponse.success("Note locked successfully", note));
    }

    @PostMapping("/{id}/unlock")
    @Operation(summary = "Unlock a note with a password")
    public ResponseEntity<ApiResponse<NoteResponse>> unlockNote(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        String userId = getUserId(authentication);
        String password = request.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password is required to unlock a note"));
        }
        NoteResponse note = noteService.unlockNote(id, userId, password);
        return ResponseEntity.ok(ApiResponse.success("Note unlocked successfully", note));
    }

    @GetMapping("/shared-with-me")
    @Operation(summary = "Get notes shared with the current user as a collaborator")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getSharedWithMe(Authentication authentication) {
        String userId = getUserId(authentication);
        List<NoteResponse> notes = noteService.getSharedWithMe(userId);
        return ResponseEntity.ok(ApiResponse.success("Shared notes retrieved", notes));
    }

    @GetMapping("/trash")
    @Operation(summary = "Get all notes in trash")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getTrash(Authentication authentication) {
        String userId = getUserId(authentication);
        List<NoteResponse> notes = noteService.getTrash(userId);
        return ResponseEntity.ok(ApiResponse.success("Trash retrieved successfully", notes));
    }

    @GetMapping("/search")
    @Operation(summary = "Search notes by title or content")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> searchNotes(
            Authentication authentication,
            @RequestParam @Parameter(description = "Search query") String q) {
        String userId = getUserId(authentication);
        List<NoteResponse> notes = noteService.searchNotes(userId, q);
        return ResponseEntity.ok(ApiResponse.success("Search results", notes));
    }

    private String getUserId(Authentication authentication) {
        // Authentication.getName() returns the email; we need the userId
        // For simplicity, we pass the email as userId context in the service
        return authentication.getName();
    }

    private Page<NoteResponse> convertListToPage(List<NoteResponse> list, int page, int size) {
        int start = Math.min(page * size, list.size());
        int end = Math.min(start + size, list.size());
        return new org.springframework.data.domain.PageImpl<>(
                list.subList(start, end),
                PageRequest.of(page, size),
                list.size()
        );
    }
}
