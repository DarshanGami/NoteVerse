package com.noteverse.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    /**
     * Summarizes the given content.
     * TODO: Integrate an AI provider (OpenAI / Anthropic) for a proper summary.
     */
    public String summarize(String content) {
        // TODO: integrate AI provider (OpenAI / Anthropic)
        if (content == null || content.isEmpty()) {
            return "";
        }
        // Strip HTML tags for summary
        String plainText = content.replaceAll("<[^>]+>", " ").trim();
        return plainText.length() > 200 ? plainText.substring(0, 200) + "..." : plainText;
    }

    /**
     * Corrects grammar and spelling in the given content.
     * TODO: Integrate an AI provider (OpenAI / Anthropic) for actual grammar correction.
     */
    public String correctGrammar(String content) {
        // TODO: integrate AI provider (OpenAI / Anthropic)
        return content;
    }

    /**
     * Rewrites the content based on the given instruction.
     * TODO: Integrate an AI provider (OpenAI / Anthropic) for actual rewriting.
     */
    public String rewrite(String content, String instruction) {
        // TODO: integrate AI provider (OpenAI / Anthropic)
        return content;
    }

    /**
     * Suggests tags based on the note content.
     * TODO: Integrate an AI provider (OpenAI / Anthropic) for intelligent tag suggestions.
     */
    public List<String> suggestTags(String content) {
        // TODO: integrate AI provider (OpenAI / Anthropic)
        return List.of("general", "note");
    }
}
