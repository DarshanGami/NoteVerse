package com.noteverse.service;

import com.noteverse.dto.request.ShareRequest;
import com.noteverse.dto.response.NoteResponse;
import com.noteverse.dto.response.ShareResponse;
import com.noteverse.exception.BadRequestException;
import com.noteverse.exception.ResourceNotFoundException;
import com.noteverse.exception.UnauthorizedException;
import com.noteverse.model.Note;
import com.noteverse.model.SharedLink;
import com.noteverse.model.User;
import com.noteverse.repository.NoteRepository;
import com.noteverse.repository.SharedLinkRepository;
import com.noteverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShareService {

    private final SharedLinkRepository sharedLinkRepository;
    private final NoteRepository noteRepository;
    private final NoteService noteService;
    private final UserRepository userRepository;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private String resolveUserId(String emailOrId) {
        if (emailOrId != null && emailOrId.contains("@")) {
            User user = userRepository.findByEmail(emailOrId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", emailOrId));
            return user.getId();
        }
        return emailOrId;
    }

    public ShareResponse createShareLink(String noteId, ShareRequest request, String emailOrId) {
        String userId = resolveUserId(emailOrId);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));

        if (!note.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to share this note");
        }

        if (note.isDeleted()) {
            throw new BadRequestException("Cannot share a deleted note");
        }

        String token = UUID.randomUUID().toString().replace("-", "");

        LocalDateTime expiresAt = null;
        if (request.getExpiresAt() != null && !request.getExpiresAt().isEmpty()) {
            try {
                expiresAt = LocalDateTime.parse(request.getExpiresAt(), DateTimeFormatter.ISO_DATE_TIME);
            } catch (DateTimeParseException e) {
                throw new BadRequestException("Invalid date format for expiresAt. Use ISO 8601 format.");
            }
        }

        SharedLink sharedLink = SharedLink.builder()
                .noteId(noteId)
                .token(token)
                .permission(request.getPermission())
                .expiresAt(expiresAt)
                .isActive(true)
                .build();

        sharedLink = sharedLinkRepository.save(sharedLink);
        log.info("Share link created for note: {} by user: {}", noteId, userId);

        return mapToShareResponse(sharedLink);
    }

    public NoteResponse getSharedNote(String token) {
        SharedLink sharedLink = sharedLinkRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Shared link not found or has been revoked"));

        if (!sharedLink.isActive()) {
            throw new BadRequestException("This share link has been revoked");
        }

        if (sharedLink.getExpiresAt() != null && LocalDateTime.now().isAfter(sharedLink.getExpiresAt())) {
            throw new BadRequestException("This share link has expired");
        }

        Note note = noteRepository.findById(sharedLink.getNoteId())
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", sharedLink.getNoteId()));

        if (note.isDeleted()) {
            throw new ResourceNotFoundException("The shared note is no longer available");
        }

        // Increment view count
        note.setViewCount(note.getViewCount() + 1);
        noteRepository.save(note);

        return noteService.mapToNoteResponse(note);
    }

    public void revokeLink(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);

        SharedLink sharedLink = sharedLinkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shared link", "id", id));

        Note note = noteRepository.findById(sharedLink.getNoteId())
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", sharedLink.getNoteId()));

        if (!note.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to revoke this share link");
        }

        sharedLink.setActive(false);
        sharedLinkRepository.save(sharedLink);
        log.info("Share link revoked: {} by user: {}", id, userId);
    }

    public List<ShareResponse> getShareLinksForNote(String noteId, String emailOrId) {
        String userId = resolveUserId(emailOrId);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));

        if (!note.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to view share links for this note");
        }

        return sharedLinkRepository.findByNoteIdAndIsActiveTrue(noteId)
                .stream()
                .map(this::mapToShareResponse)
                .collect(Collectors.toList());
    }

    private ShareResponse mapToShareResponse(SharedLink sharedLink) {
        String shareUrl = frontendUrl + "/share/" + sharedLink.getToken();

        return ShareResponse.builder()
                .id(sharedLink.getId())
                .token(sharedLink.getToken())
                .shareUrl(shareUrl)
                .permission(sharedLink.getPermission())
                .expiresAt(sharedLink.getExpiresAt())
                .createdAt(sharedLink.getCreatedAt())
                .isActive(sharedLink.isActive())
                .build();
    }
}
