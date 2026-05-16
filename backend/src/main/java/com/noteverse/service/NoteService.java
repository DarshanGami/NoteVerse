package com.noteverse.service;

import com.noteverse.dto.request.NoteRequest;
import com.noteverse.dto.response.CollaboratorResponse;
import com.noteverse.dto.response.NoteResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private String resolveUserId(String emailOrId) {
        // Check if it looks like an email (contains '@')
        if (emailOrId != null && emailOrId.contains("@")) {
            User user = userRepository.findByEmail(emailOrId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", emailOrId));
            return user.getId();
        }
        return emailOrId;
    }

    public NoteResponse createNote(NoteRequest request, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        int wordCount = countWords(request.getContent());

        Note note = Note.builder()
                .title(request.getTitle() != null ? request.getTitle() : "Untitled")
                .content(request.getContent())
                .userId(userId)
                .folderId(request.getFolderId())
                .tags(request.getTags())
                .isPinned(request.isPinned())
                .isFavourite(request.isFavourite())
                .isDeleted(false)
                .isLocked(false)
                .version(1)
                .viewCount(0)
                .wordCount(wordCount)
                .build();

        note = noteRepository.save(note);
        log.info("Note created: {} by user: {}", note.getId(), userId);
        return mapToNoteResponse(note);
    }

    public NoteResponse updateNote(String id, NoteRequest request, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Note note = findNoteWithAccess(id, userId, "WRITE");

        if (note.isDeleted()) {
            throw new BadRequestException("Cannot update a deleted note. Restore it first.");
        }

        if (request.getTitle() != null) {
            note.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            note.setContent(request.getContent());
            note.setWordCount(countWords(request.getContent()));
        }
        if (request.getFolderId() != null) {
            note.setFolderId(request.getFolderId());
        }
        if (request.getTags() != null) {
            note.setTags(request.getTags());
        }

        note.setPinned(request.isPinned());
        note.setFavourite(request.isFavourite());
        note.setVersion(note.getVersion() + 1);

        note = noteRepository.save(note);
        log.info("Note updated: {} version: {}", note.getId(), note.getVersion());
        return mapToNoteResponse(note);
    }

    public Page<NoteResponse> getNotes(String emailOrId, Pageable pageable, String folderId,
                                        Boolean isPinned, Boolean isFavourite, String tagId) {
        String userId = resolveUserId(emailOrId);
        Page<Note> notes;

        if (folderId != null && !folderId.isEmpty()) {
            notes = noteRepository.findByUserIdAndFolderIdAndIsDeletedFalse(userId, folderId, pageable);
        } else if (Boolean.TRUE.equals(isPinned)) {
            notes = noteRepository.findByUserIdAndIsPinnedTrueAndIsDeletedFalse(userId, pageable);
        } else if (Boolean.TRUE.equals(isFavourite)) {
            notes = noteRepository.findByUserIdAndIsFavouriteTrueAndIsDeletedFalse(userId, pageable);
        } else if (tagId != null && !tagId.isEmpty()) {
            notes = noteRepository.findByUserIdAndTagsContainingAndIsDeletedFalse(userId, tagId, pageable);
        } else {
            notes = noteRepository.findByUserIdAndIsDeletedFalse(userId, pageable);
        }

        return notes.map(this::mapToNoteResponse);
    }

    public NoteResponse getNoteById(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Note note = findNoteWithAccess(id, userId, "READ");
        note.setViewCount(note.getViewCount() + 1);
        noteRepository.save(note);
        return mapToNoteResponse(note);
    }

    public void softDelete(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Note note = findNoteByIdAndUserId(id, userId);
        note.setDeleted(true);
        note.setDeletedAt(LocalDateTime.now());
        noteRepository.save(note);
        log.info("Note soft deleted: {} by user: {}", id, userId);
    }

    public void hardDelete(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Note note = findNoteByIdAndUserId(id, userId);
        noteRepository.delete(note);
        log.info("Note permanently deleted: {} by user: {}", id, userId);
    }

    public NoteResponse restore(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Note note = findNoteByIdAndUserId(id, userId);

        if (!note.isDeleted()) {
            throw new BadRequestException("Note is not in trash");
        }

        note.setDeleted(false);
        note.setDeletedAt(null);
        note = noteRepository.save(note);
        log.info("Note restored: {} by user: {}", id, userId);
        return mapToNoteResponse(note);
    }

    public NoteResponse togglePin(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Note note = findNoteByIdAndUserId(id, userId);
        note.setPinned(!note.isPinned());
        note = noteRepository.save(note);
        return mapToNoteResponse(note);
    }

    public NoteResponse toggleFavourite(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Note note = findNoteByIdAndUserId(id, userId);
        note.setFavourite(!note.isFavourite());
        note = noteRepository.save(note);
        return mapToNoteResponse(note);
    }

    public NoteResponse lockNote(String id, String emailOrId, String password) {
        String userId = resolveUserId(emailOrId);
        Note note = findNoteByIdAndUserId(id, userId);

        if (note.isLocked()) {
            throw new BadRequestException("Note is already locked");
        }

        note.setLocked(true);
        note.setLockPasswordHash(passwordEncoder.encode(password));
        note = noteRepository.save(note);
        log.info("Note locked: {} by user: {}", id, userId);
        return mapToNoteResponse(note);
    }

    public NoteResponse unlockNote(String id, String emailOrId, String password) {
        String userId = resolveUserId(emailOrId);
        Note note = findNoteByIdAndUserId(id, userId);

        if (!note.isLocked()) {
            throw new BadRequestException("Note is not locked");
        }

        if (!passwordEncoder.matches(password, note.getLockPasswordHash())) {
            throw new UnauthorizedException("Incorrect lock password");
        }

        note.setLocked(false);
        note.setLockPasswordHash(null);
        note = noteRepository.save(note);
        log.info("Note unlocked: {} by user: {}", id, userId);
        return mapToNoteResponse(note);
    }

    public List<NoteResponse> getSharedWithMe(String emailOrId) {
        String userId = resolveUserId(emailOrId);
        return noteRepository.findSharedWithUser(userId)
                .stream()
                .map(this::mapToNoteResponse)
                .collect(Collectors.toList());
    }

    public List<NoteResponse> getTrash(String emailOrId) {
        String userId = resolveUserId(emailOrId);
        return noteRepository.findByUserIdAndIsDeletedTrue(userId)
                .stream()
                .map(this::mapToNoteResponse)
                .collect(Collectors.toList());
    }

    public List<NoteResponse> searchNotes(String emailOrId, String query) {
        String userId = resolveUserId(emailOrId);
        if (query == null || query.trim().isEmpty()) {
            return noteRepository.findByUserIdAndIsDeletedFalse(userId)
                    .stream()
                    .map(this::mapToNoteResponse)
                    .collect(Collectors.toList());
        }
        return noteRepository.searchByTitleOrContent(userId, query)
                .stream()
                .map(this::mapToNoteResponse)
                .collect(Collectors.toList());
    }

    private Note findNoteByIdAndUserId(String id, String userId) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", id));
        if (!note.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this note");
        }
        return note;
    }

    private Note findNoteWithAccess(String id, String userId, String requiredPermission) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", id));
        if (note.getUserId().equals(userId)) return note;
        if (note.getCollaborators() != null) {
            boolean allowed = note.getCollaborators().stream().anyMatch(c ->
                    c.getUserId().equals(userId) &&
                    ("READ".equals(requiredPermission) ||
                     ("WRITE".equals(requiredPermission) && "WRITE".equals(c.getPermission()))));
            if (allowed) return note;
        }
        throw new UnauthorizedException("You do not have permission to access this note");
    }

    private int countWords(String content) {
        if (content == null || content.trim().isEmpty()) {
            return 0;
        }
        // Strip HTML tags for word count
        String text = content.replaceAll("<[^>]+>", " ").trim();
        if (text.isEmpty()) return 0;
        return text.split("\\s+").length;
    }

    public NoteResponse mapToNoteResponse(Note note) {
        List<CollaboratorResponse> collaborators = note.getCollaborators() == null ? List.of() :
                note.getCollaborators().stream()
                        .map(c -> CollaboratorResponse.builder()
                                .userId(c.getUserId())
                                .email(c.getEmail())
                                .name(c.getName())
                                .permission(c.getPermission())
                                .build())
                        .collect(Collectors.toList());

        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .userId(note.getUserId())
                .folderId(note.getFolderId())
                .tags(note.getTags())
                .isPinned(note.isPinned())
                .isFavourite(note.isFavourite())
                .isDeleted(note.isDeleted())
                .deletedAt(note.getDeletedAt())
                .isLocked(note.isLocked())
                .collaborators(collaborators)
                .version(note.getVersion())
                .viewCount(note.getViewCount())
                .wordCount(note.getWordCount())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
