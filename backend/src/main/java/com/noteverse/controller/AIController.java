package com.noteverse.controller;

import com.noteverse.dto.request.AIRequest;
import com.noteverse.dto.response.ApiResponse;
import com.noteverse.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI-powered note assistance endpoints")
public class AIController {

    private final AIService aiService;

    @PostMapping("/summarize")
    @Operation(summary = "Summarize note content")
    public ResponseEntity<ApiResponse<Map<String, String>>> summarize(@Valid @RequestBody AIRequest request) {
        String summary = aiService.summarize(request.getContent());
        return ResponseEntity.ok(ApiResponse.success("Content summarized successfully",
                Map.of("summary", summary)));
    }

    @PostMapping("/grammar")
    @Operation(summary = "Correct grammar in note content")
    public ResponseEntity<ApiResponse<Map<String, String>>> correctGrammar(@Valid @RequestBody AIRequest request) {
        String corrected = aiService.correctGrammar(request.getContent());
        return ResponseEntity.ok(ApiResponse.success("Grammar corrected successfully",
                Map.of("corrected", corrected)));
    }

    @PostMapping("/rewrite")
    @Operation(summary = "Rewrite note content based on instruction")
    public ResponseEntity<ApiResponse<Map<String, String>>> rewrite(@Valid @RequestBody AIRequest request) {
        String rewritten = aiService.rewrite(request.getContent(), request.getInstruction());
        return ResponseEntity.ok(ApiResponse.success("Content rewritten successfully",
                Map.of("rewritten", rewritten)));
    }

    @PostMapping("/tags")
    @Operation(summary = "Suggest tags for note content")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> suggestTags(@Valid @RequestBody AIRequest request) {
        List<String> tags = aiService.suggestTags(request.getContent());
        return ResponseEntity.ok(ApiResponse.success("Tags suggested successfully",
                Map.of("tags", tags)));
    }
}
