package com.noteverse.service;

import com.noteverse.dto.request.TagRequest;
import com.noteverse.dto.response.TagResponse;
import com.noteverse.exception.BadRequestException;
import com.noteverse.exception.ResourceNotFoundException;
import com.noteverse.exception.UnauthorizedException;
import com.noteverse.model.Tag;
import com.noteverse.model.User;
import com.noteverse.repository.TagRepository;
import com.noteverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagService {

    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    private String resolveUserId(String emailOrId) {
        if (emailOrId != null && emailOrId.contains("@")) {
            User user = userRepository.findByEmail(emailOrId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", emailOrId));
            return user.getId();
        }
        return emailOrId;
    }

    public TagResponse createTag(TagRequest request, String emailOrId) {
        String userId = resolveUserId(emailOrId);

        if (tagRepository.existsByUserIdAndName(userId, request.getName())) {
            throw new BadRequestException("Tag with name '" + request.getName() + "' already exists");
        }

        Tag tag = Tag.builder()
                .name(request.getName())
                .color(request.getColor() != null ? request.getColor() : "#808080")
                .userId(userId)
                .build();

        tag = tagRepository.save(tag);
        log.info("Tag created: {} by user: {}", tag.getId(), userId);
        return mapToTagResponse(tag);
    }

    public List<TagResponse> getTags(String emailOrId) {
        String userId = resolveUserId(emailOrId);
        return tagRepository.findByUserId(userId)
                .stream()
                .map(this::mapToTagResponse)
                .collect(Collectors.toList());
    }

    public TagResponse updateTag(String id, TagRequest request, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Tag tag = findTagByIdAndUserId(id, userId);

        if (!tag.getName().equals(request.getName()) &&
                tagRepository.existsByUserIdAndName(userId, request.getName())) {
            throw new BadRequestException("Tag with name '" + request.getName() + "' already exists");
        }

        tag.setName(request.getName());
        if (request.getColor() != null) {
            tag.setColor(request.getColor());
        }

        tag = tagRepository.save(tag);
        log.info("Tag updated: {} by user: {}", id, userId);
        return mapToTagResponse(tag);
    }

    public void deleteTag(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Tag tag = findTagByIdAndUserId(id, userId);
        tagRepository.delete(tag);
        log.info("Tag deleted: {} by user: {}", id, userId);
    }

    private Tag findTagByIdAndUserId(String id, String userId) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", id));

        if (!tag.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this tag");
        }

        return tag;
    }

    public TagResponse mapToTagResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .color(tag.getColor())
                .userId(tag.getUserId())
                .createdAt(tag.getCreatedAt())
                .build();
    }
}
