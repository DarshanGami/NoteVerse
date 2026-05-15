package com.noteverse.service;

import com.noteverse.dto.response.UserResponse;
import com.noteverse.exception.ResourceNotFoundException;
import com.noteverse.exception.UnauthorizedException;
import com.noteverse.model.AuditLog;
import com.noteverse.model.Session;
import com.noteverse.model.User;
import com.noteverse.repository.AuditLogRepository;
import com.noteverse.repository.SessionRepository;
import com.noteverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettingsService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;

    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return authService.mapToUserResponse(user);
    }

    public UserResponse updateProfile(String email, Map<String, String> updates) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (updates.containsKey("name") && updates.get("name") != null && !updates.get("name").isBlank()) {
            user.setName(updates.get("name"));
        }

        if (updates.containsKey("profilePicture")) {
            user.setProfilePicture(updates.get("profilePicture"));
        }

        user = userRepository.save(user);
        log.info("Profile updated for: {}", email);
        return authService.mapToUserResponse(user);
    }

    public List<Session> getSessions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return sessionRepository.findByUserIdAndIsActiveTrue(user.getId());
    }

    public void revokeSession(String sessionId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));

        if (!session.getUserId().equals(user.getId())) {
            throw new UnauthorizedException("You do not have permission to revoke this session");
        }

        session.setActive(false);
        sessionRepository.save(session);
        log.info("Session revoked: {} by user: {}", sessionId, email);
    }

    public List<AuditLog> getAuditLogs(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public void saveAuditLog(String userId, String action, String resource, String resourceId, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .resource(resource)
                .resourceId(resourceId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }
}
