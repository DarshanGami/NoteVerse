package com.noteverse.service;

import com.noteverse.dto.request.LoginRequest;
import com.noteverse.dto.request.RegisterRequest;
import com.noteverse.dto.request.ResetPasswordRequest;
import com.noteverse.dto.response.AuthResponse;
import com.noteverse.dto.response.UserResponse;
import com.noteverse.exception.BadRequestException;
import com.noteverse.exception.ResourceNotFoundException;
import com.noteverse.exception.UnauthorizedException;
import com.noteverse.model.Session;
import com.noteverse.model.User;
import com.noteverse.repository.SessionRepository;
import com.noteverse.repository.UserRepository;
import com.noteverse.security.JwtUtils;
import com.noteverse.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final EmailService emailService;

    // In-memory OTP store (consider Redis in production)
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static class OtpEntry {
        String otp;
        LocalDateTime expiresAt;

        OtpEntry(String otp) {
            this.otp = otp;
            this.expiresAt = LocalDateTime.now().plusMinutes(10);
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(List.of("ROLE_USER"))
                .isVerified(false)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            log.warn("Could not send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtils.generateAccessToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        Session session = Session.builder()
                .userId(user.getId())
                .refreshToken(refreshToken)
                .isActive(true)
                .lastActivity(LocalDateTime.now())
                .build();
        sessionRepository.save(session);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String accessToken = jwtUtils.generateAccessToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        Session session = Session.builder()
                .userId(user.getId())
                .refreshToken(refreshToken)
                .isActive(true)
                .lastActivity(LocalDateTime.now())
                .build();
        sessionRepository.save(session);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        Session session = sessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Session not found"));

        if (!session.isActive()) {
            throw new UnauthorizedException("Session has been revoked");
        }

        String email = jwtUtils.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String newAccessToken = jwtUtils.generateAccessToken(userDetails);
        String newRefreshToken = jwtUtils.generateRefreshToken(email);

        session.setRefreshToken(newRefreshToken);
        session.setLastActivity(LocalDateTime.now());
        sessionRepository.save(session);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    public void logout(String refreshToken) {
        sessionRepository.findByRefreshToken(refreshToken).ifPresent(session -> {
            session.setActive(false);
            sessionRepository.save(session);
        });
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String otp = generateOtp();
        otpStore.put(email, new OtpEntry(otp));

        emailService.sendPasswordResetEmail(email, user.getName(), otp);
        log.info("Password reset OTP generated for: {}", email);
    }

    public void resetPassword(ResetPasswordRequest request) {
        OtpEntry entry = otpStore.get(request.getEmail());

        if (entry == null) {
            throw new BadRequestException("No password reset request found for this email");
        }

        if (entry.isExpired()) {
            otpStore.remove(request.getEmail());
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (!entry.otp.equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpStore.remove(request.getEmail());

        // Invalidate all active sessions
        List<Session> sessions = sessionRepository.findByUserIdAndIsActiveTrue(user.getId());
        sessions.forEach(session -> {
            session.setActive(false);
            sessionRepository.save(session);
        });

        log.info("Password reset successfully for: {}", request.getEmail());
    }

    public Map<String, String> setupTwoFactor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String secret = generateTotpSecret();
        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        String qrCodeUrl = String.format(
                "otpauth://totp/NoteVerse:%s?secret=%s&issuer=NoteVerse",
                email, secret
        );

        Map<String, String> result = new HashMap<>();
        result.put("secret", secret);
        result.put("qrCodeUrl", qrCodeUrl);
        return result;
    }

    public boolean verifyTotp(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.getTwoFactorSecret() == null) {
            throw new BadRequestException("Two-factor authentication not set up");
        }

        // Simple verification - in production use a proper TOTP library like GoogleAuthenticator
        boolean valid = validateTotpCode(user.getTwoFactorSecret(), code);

        if (valid) {
            user.setTwoFactorEnabled(true);
            userRepository.save(user);
        }

        return valid;
    }

    public void disableTwoFactor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private String generateTotpSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes)
                .replace("+", "A").replace("/", "B").replace("=", "C")
                .substring(0, 32);
    }

    private boolean validateTotpCode(String secret, String code) {
        // TODO: integrate proper TOTP library (e.g., com.warrenstrange:googleauth)
        // This is a placeholder implementation
        return code != null && code.length() == 6 && code.matches("\\d+");
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .isVerified(user.isVerified())
                .isTwoFactorEnabled(user.isTwoFactorEnabled())
                .profilePicture(user.getProfilePicture())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
