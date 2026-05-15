package com.noteverse.service;

import com.noteverse.dto.request.CommentRequest;
import com.noteverse.dto.response.CommentResponse;
import com.noteverse.exception.BadRequestException;
import com.noteverse.exception.ResourceNotFoundException;
import com.noteverse.exception.UnauthorizedException;
import com.noteverse.model.Comment;
import com.noteverse.model.Note;
import com.noteverse.model.User;
import com.noteverse.repository.CommentRepository;
import com.noteverse.repository.NoteRepository;
import com.noteverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    private String resolveUserId(String emailOrId) {
        if (emailOrId != null && emailOrId.contains("@")) {
            User user = userRepository.findByEmail(emailOrId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", emailOrId));
            return user.getId();
        }
        return emailOrId;
    }

    public CommentResponse addComment(String noteId, CommentRequest request, String emailOrId) {
        String userId = resolveUserId(emailOrId);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));

        if (note.isDeleted()) {
            throw new BadRequestException("Cannot comment on a deleted note");
        }

        Comment comment = Comment.builder()
                .noteId(noteId)
                .userId(userId)
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);
        log.info("Comment added to note: {} by user: {}", noteId, userId);
        return mapToCommentResponse(comment);
    }

    public List<CommentResponse> getComments(String noteId) {
        noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));

        return commentRepository.findByNoteIdOrderByCreatedAtAsc(noteId)
                .stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    public CommentResponse updateComment(String noteId, String commentId, CommentRequest request, String emailOrId) {
        String userId = resolveUserId(emailOrId);

        noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to edit this comment");
        }

        if (!comment.getNoteId().equals(noteId)) {
            throw new UnauthorizedException("Comment does not belong to this note");
        }

        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);
        log.info("Comment updated: {} by user: {}", commentId, userId);
        return mapToCommentResponse(comment);
    }

    public void deleteComment(String noteId, String commentId, String emailOrId) {
        String userId = resolveUserId(emailOrId);

        noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to delete this comment");
        }

        if (!comment.getNoteId().equals(noteId)) {
            throw new UnauthorizedException("Comment does not belong to this note");
        }

        commentRepository.delete(comment);
        log.info("Comment deleted: {} by user: {}", commentId, userId);
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .noteId(comment.getNoteId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
