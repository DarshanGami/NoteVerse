package com.noteverse.service;

import com.noteverse.dto.request.CollaborateRequest;
import com.noteverse.dto.response.CollaboratorResponse;
import com.noteverse.exception.BadRequestException;
import com.noteverse.exception.ResourceNotFoundException;
import com.noteverse.exception.UnauthorizedException;
import com.noteverse.model.Collaborator;
import com.noteverse.model.Note;
import com.noteverse.model.User;
import com.noteverse.repository.NoteRepository;
import com.noteverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollaborateService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    private String resolveUserId(String emailOrId) {
        if (emailOrId != null && emailOrId.contains("@")) {
            return userRepository.findByEmail(emailOrId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", emailOrId))
                    .getId();
        }
        return emailOrId;
    }

    /** Invite a user to collaborate on a note */
    public CollaboratorResponse invite(String noteId, CollaborateRequest request, String ownerEmailOrId) {
        String ownerId = resolveUserId(ownerEmailOrId);
        Note note = getOwnedNote(noteId, ownerId);

        User invitee = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + request.getEmail()));

        if (invitee.getId().equals(ownerId)) {
            throw new BadRequestException("You cannot invite yourself");
        }

        if (note.getCollaborators() == null) {
            note.setCollaborators(new ArrayList<>());
        }

        // Update permission if already a collaborator
        boolean existing = false;
        for (Collaborator c : note.getCollaborators()) {
            if (c.getUserId().equals(invitee.getId())) {
                c.setPermission(request.getPermission());
                existing = true;
                break;
            }
        }
        if (!existing) {
            note.getCollaborators().add(Collaborator.builder()
                    .userId(invitee.getId())
                    .email(invitee.getEmail())
                    .name(invitee.getName())
                    .permission(request.getPermission())
                    .build());
        }

        noteRepository.save(note);
        log.info("User {} invited to note {} with {} permission by {}", invitee.getEmail(), noteId, request.getPermission(), ownerId);

        return toResponse(note.getCollaborators().stream()
                .filter(c -> c.getUserId().equals(invitee.getId()))
                .findFirst().orElseThrow());
    }

    /** List collaborators of a note */
    public List<CollaboratorResponse> getCollaborators(String noteId, String ownerEmailOrId) {
        String ownerId = resolveUserId(ownerEmailOrId);
        Note note = getOwnedNote(noteId, ownerId);
        if (note.getCollaborators() == null) return List.of();
        return note.getCollaborators().stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Remove a collaborator from a note */
    public void removeCollaborator(String noteId, String collaboratorUserId, String ownerEmailOrId) {
        String ownerId = resolveUserId(ownerEmailOrId);
        Note note = getOwnedNote(noteId, ownerId);

        if (note.getCollaborators() != null) {
            boolean removed = note.getCollaborators().removeIf(c -> c.getUserId().equals(collaboratorUserId));
            if (!removed) throw new ResourceNotFoundException("Collaborator not found on this note");
            noteRepository.save(note);
        }
        log.info("Collaborator {} removed from note {} by {}", collaboratorUserId, noteId, ownerId);
    }

    /** Check if a user has access to a note (owner or collaborator) */
    public boolean hasAccess(Note note, String userId, String requiredPermission) {
        if (note.getUserId().equals(userId)) return true; // owner always has full access
        if (note.getCollaborators() == null) return false;
        return note.getCollaborators().stream().anyMatch(c ->
                c.getUserId().equals(userId) &&
                (requiredPermission.equals("READ") ||
                 (requiredPermission.equals("WRITE") && c.getPermission().equals("WRITE")))
        );
    }

    private Note getOwnedNote(String noteId, String ownerId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));
        if (!note.getUserId().equals(ownerId)) {
            throw new UnauthorizedException("Only the note owner can manage collaborators");
        }
        return note;
    }

    private CollaboratorResponse toResponse(Collaborator c) {
        return CollaboratorResponse.builder()
                .userId(c.getUserId())
                .email(c.getEmail())
                .name(c.getName())
                .permission(c.getPermission())
                .build();
    }
}
