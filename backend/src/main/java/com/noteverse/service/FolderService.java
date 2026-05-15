package com.noteverse.service;

import com.noteverse.dto.request.FolderRequest;
import com.noteverse.dto.response.FolderResponse;
import com.noteverse.exception.BadRequestException;
import com.noteverse.exception.ResourceNotFoundException;
import com.noteverse.exception.UnauthorizedException;
import com.noteverse.model.Folder;
import com.noteverse.model.User;
import com.noteverse.repository.FolderRepository;
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
public class FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    private String resolveUserId(String emailOrId) {
        if (emailOrId != null && emailOrId.contains("@")) {
            User user = userRepository.findByEmail(emailOrId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", emailOrId));
            return user.getId();
        }
        return emailOrId;
    }

    public FolderResponse createFolder(FolderRequest request, String emailOrId) {
        String userId = resolveUserId(emailOrId);

        if (request.getParentId() != null && !request.getParentId().isEmpty()) {
            Folder parentFolder = folderRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent folder", "id", request.getParentId()));

            if (!parentFolder.getUserId().equals(userId)) {
                throw new UnauthorizedException("You do not have permission to create a subfolder here");
            }
        }

        Folder folder = Folder.builder()
                .name(request.getName())
                .userId(userId)
                .parentId(request.getParentId())
                .children(new ArrayList<>())
                .build();

        folder = folderRepository.save(folder);

        // Update parent's children list
        if (request.getParentId() != null && !request.getParentId().isEmpty()) {
            final String newFolderId = folder.getId();
            folderRepository.findById(request.getParentId()).ifPresent(parent -> {
                if (parent.getChildren() == null) {
                    parent.setChildren(new ArrayList<>());
                }
                parent.getChildren().add(newFolderId);
                folderRepository.save(parent);
            });
        }

        log.info("Folder created: {} by user: {}", folder.getId(), userId);
        return mapToFolderResponse(folder);
    }

    public List<FolderResponse> getFolders(String emailOrId) {
        String userId = resolveUserId(emailOrId);
        return folderRepository.findByUserId(userId)
                .stream()
                .map(this::mapToFolderResponse)
                .collect(Collectors.toList());
    }

    public List<FolderResponse> getRootFolders(String emailOrId) {
        String userId = resolveUserId(emailOrId);
        return folderRepository.findByUserIdAndParentIdIsNull(userId)
                .stream()
                .map(this::mapToFolderResponse)
                .collect(Collectors.toList());
    }

    public FolderResponse getFolderById(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Folder folder = findFolderByIdAndUserId(id, userId);
        return mapToFolderResponse(folder);
    }

    public FolderResponse updateFolder(String id, FolderRequest request, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Folder folder = findFolderByIdAndUserId(id, userId);

        folder.setName(request.getName());

        if (request.getParentId() != null && !request.getParentId().equals(folder.getParentId())) {
            if (request.getParentId().equals(id)) {
                throw new BadRequestException("A folder cannot be its own parent");
            }

            // Remove from old parent
            if (folder.getParentId() != null) {
                folderRepository.findById(folder.getParentId()).ifPresent(oldParent -> {
                    if (oldParent.getChildren() != null) {
                        oldParent.getChildren().remove(id);
                        folderRepository.save(oldParent);
                    }
                });
            }

            // Add to new parent
            folderRepository.findById(request.getParentId()).ifPresent(newParent -> {
                if (newParent.getChildren() == null) {
                    newParent.setChildren(new ArrayList<>());
                }
                newParent.getChildren().add(id);
                folderRepository.save(newParent);
            });

            folder.setParentId(request.getParentId());
        }

        folder = folderRepository.save(folder);
        log.info("Folder updated: {} by user: {}", id, userId);
        return mapToFolderResponse(folder);
    }

    public void deleteFolder(String id, String emailOrId) {
        String userId = resolveUserId(emailOrId);
        Folder folder = findFolderByIdAndUserId(id, userId);

        // Remove from parent's children list
        if (folder.getParentId() != null) {
            folderRepository.findById(folder.getParentId()).ifPresent(parent -> {
                if (parent.getChildren() != null) {
                    parent.getChildren().remove(id);
                    folderRepository.save(parent);
                }
            });
        }

        // Delete all child folders recursively
        if (folder.getChildren() != null && !folder.getChildren().isEmpty()) {
            folder.getChildren().forEach(childId -> {
                folderRepository.findById(childId).ifPresent(child -> {
                    if (child.getUserId().equals(userId)) {
                        folderRepository.delete(child);
                    }
                });
            });
        }

        folderRepository.delete(folder);
        log.info("Folder deleted: {} by user: {}", id, userId);
    }

    private Folder findFolderByIdAndUserId(String id, String userId) {
        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", id));

        if (!folder.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this folder");
        }

        return folder;
    }

    public FolderResponse mapToFolderResponse(Folder folder) {
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .userId(folder.getUserId())
                .parentId(folder.getParentId())
                .children(folder.getChildren())
                .createdAt(folder.getCreatedAt())
                .updatedAt(folder.getUpdatedAt())
                .build();
    }
}
