package com.noteverse.controller;

import com.noteverse.dto.request.ForgotPasswordRequest;
import com.noteverse.dto.request.LoginRequest;
import com.noteverse.dto.request.RegisterRequest;
import com.noteverse.dto.request.ResetPasswordRequest;
import com.noteverse.dto.response.ApiResponse;
import com.noteverse.dto.response.AuthResponse;
import com.noteverse.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Refresh token is required"));
        }
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate session")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        return ResponseEntity.ok(ApiResponse.successMessage("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset OTP")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.successMessage(
                "If an account with that email exists, a password reset OTP has been sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using OTP")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.successMessage("Password reset successfully"));
    }

    @PostMapping("/2fa/setup")
    @Operation(summary = "Set up two-factor authentication")
    public ResponseEntity<ApiResponse<Map<String, String>>> setup2fa(Authentication authentication) {
        Map<String, String> result = authService.setupTwoFactor(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Two-factor authentication setup initiated", result));
    }

    @PostMapping("/2fa/verify")
    @Operation(summary = "Verify TOTP code and enable 2FA")
    public ResponseEntity<ApiResponse<Void>> verify2fa(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String code = request.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("TOTP code is required"));
        }
        boolean valid = authService.verifyTotp(authentication.getName(), code);
        if (!valid) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid TOTP code"));
        }
        return ResponseEntity.ok(ApiResponse.successMessage("Two-factor authentication enabled successfully"));
    }

    @PostMapping("/2fa/disable")
    @Operation(summary = "Disable two-factor authentication")
    public ResponseEntity<ApiResponse<Void>> disable2fa(Authentication authentication) {
        authService.disableTwoFactor(authentication.getName());
        return ResponseEntity.ok(ApiResponse.successMessage("Two-factor authentication disabled successfully"));
    }
}
