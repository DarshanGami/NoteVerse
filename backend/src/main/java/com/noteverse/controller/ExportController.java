package com.noteverse.controller;

import com.noteverse.dto.response.NoteResponse;
import com.noteverse.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Note export endpoints")
public class ExportController {

    private final NoteService noteService;

    @GetMapping("/{noteId}/markdown")
    @Operation(summary = "Export note as Markdown")
    public ResponseEntity<String> exportAsMarkdown(
            Authentication authentication,
            @PathVariable String noteId) {
        NoteResponse note = noteService.getNoteById(noteId, authentication.getName());

        String markdown = convertToMarkdown(note);

        String filename = sanitizeFilename(note.getTitle()) + ".md";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(markdown);
    }

    @GetMapping("/{noteId}/text")
    @Operation(summary = "Export note as plain text")
    public ResponseEntity<String> exportAsText(
            Authentication authentication,
            @PathVariable String noteId) {
        NoteResponse note = noteService.getNoteById(noteId, authentication.getName());

        String plainText = convertToPlainText(note);

        String filename = sanitizeFilename(note.getTitle()) + ".txt";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(plainText);
    }

    private String convertToMarkdown(NoteResponse note) {
        StringBuilder sb = new StringBuilder();

        sb.append("# ").append(note.getTitle() != null ? note.getTitle() : "Untitled").append("\n\n");
        sb.append("*Created: ").append(note.getCreatedAt()).append("*\n");
        sb.append("*Updated: ").append(note.getUpdatedAt()).append("*\n\n");
        sb.append("---\n\n");

        if (note.getContent() != null) {
            // Strip HTML tags and convert basic formatting to markdown
            String content = note.getContent();
            content = content.replaceAll("<h1[^>]*>(.*?)</h1>", "# $1\n");
            content = content.replaceAll("<h2[^>]*>(.*?)</h2>", "## $1\n");
            content = content.replaceAll("<h3[^>]*>(.*?)</h3>", "### $1\n");
            content = content.replaceAll("<strong[^>]*>(.*?)</strong>", "**$1**");
            content = content.replaceAll("<b[^>]*>(.*?)</b>", "**$1**");
            content = content.replaceAll("<em[^>]*>(.*?)</em>", "*$1*");
            content = content.replaceAll("<i[^>]*>(.*?)</i>", "*$1*");
            content = content.replaceAll("<br\\s*/?>", "\n");
            content = content.replaceAll("<p[^>]*>(.*?)</p>", "$1\n\n");
            content = content.replaceAll("<li[^>]*>(.*?)</li>", "- $1\n");
            content = content.replaceAll("<[^>]+>", "");
            content = content.trim();
            sb.append(content);
        }

        return sb.toString();
    }

    private String convertToPlainText(NoteResponse note) {
        StringBuilder sb = new StringBuilder();

        sb.append(note.getTitle() != null ? note.getTitle() : "Untitled").append("\n");
        sb.append("=".repeat(50)).append("\n\n");
        sb.append("Created: ").append(note.getCreatedAt()).append("\n");
        sb.append("Updated: ").append(note.getUpdatedAt()).append("\n\n");

        if (note.getContent() != null) {
            // Strip all HTML tags
            String content = note.getContent()
                    .replaceAll("<br\\s*/?>", "\n")
                    .replaceAll("<p[^>]*>", "")
                    .replaceAll("</p>", "\n\n")
                    .replaceAll("<li[^>]*>", "- ")
                    .replaceAll("</li>", "\n")
                    .replaceAll("<[^>]+>", "")
                    .replaceAll("&nbsp;", " ")
                    .replaceAll("&amp;", "&")
                    .replaceAll("&lt;", "<")
                    .replaceAll("&gt;", ">")
                    .replaceAll("&quot;", "\"")
                    .trim();
            sb.append(content);
        }

        return sb.toString();
    }

    private String sanitizeFilename(String title) {
        if (title == null || title.isBlank()) {
            return "note";
        }
        return title.replaceAll("[^a-zA-Z0-9._-]", "_").toLowerCase();
    }
}
