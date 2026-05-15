package com.noteverse.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@noteverse.app}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String userName, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("NoteVerse - Password Reset OTP");

            String htmlContent = buildPasswordResetEmailHtml(userName, otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            // Fallback to simple mail
            sendSimplePasswordResetEmail(toEmail, otp);
        }
    }

    private void sendSimplePasswordResetEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("NoteVerse - Password Reset OTP");
            message.setText(String.format(
                    "Your NoteVerse password reset OTP is: %s\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request a password reset, please ignore this email.",
                    otp
            ));
            mailSender.send(message);
            log.info("Simple password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send simple password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to NoteVerse!");
            message.setText(String.format(
                    "Hello %s,\n\nWelcome to NoteVerse! Your account has been created successfully.\n\nStart organizing your thoughts and ideas at: %s\n\nBest regards,\nThe NoteVerse Team",
                    userName, frontendUrl
            ));
            mailSender.send(message);
            log.info("Welcome email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendShareNotificationEmail(String toEmail, String senderName, String noteTitle, String shareUrl) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(String.format("NoteVerse - %s shared a note with you", senderName));
            message.setText(String.format(
                    "Hello,\n\n%s has shared a note with you: \"%s\"\n\nView the note at: %s\n\nBest regards,\nThe NoteVerse Team",
                    senderName, noteTitle, shareUrl
            ));
            mailSender.send(message);
            log.info("Share notification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send share notification email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildPasswordResetEmailHtml(String userName, String otp) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Password Reset</title>
                </head>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">NoteVerse</h1>
                    </div>
                    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #333333;">Password Reset Request</h2>
                        <p>Hello %s,</p>
                        <p>We received a request to reset your NoteVerse password. Use the OTP below to complete the process:</p>
                        <div style="background: #f5f5f5; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                            <h2 style="color: #667eea; letter-spacing: 8px; margin: 0; font-size: 32px;">%s</h2>
                        </div>
                        <p style="color: #666666;"><strong>This OTP is valid for 10 minutes.</strong></p>
                        <p style="color: #666666;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                        <p style="color: #999999; font-size: 12px;">This email was sent by NoteVerse. Please do not reply to this email.</p>
                    </div>
                </body>
                </html>
                """, userName, otp);
    }
}
