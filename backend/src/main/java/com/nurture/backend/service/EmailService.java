
package com.nurture.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendRegistrationOtp(String email, String otp) {
        sendEmail(
                email,
                "Nurture AI - Registration OTP",
                "Thank you for registering with Nurture AI."
                        + "\n\nYour OTP is: " + otp
                        + "\n\nValid for 5 minutes."
        );
    }

    public void sendFamilyAccessOtp(String email, String otp) {
        sendEmail(
                email,
                "Nurture AI - Family Access OTP",
                "A family member is requesting access to your profile."
                        + "\n\nYour OTP is: " + otp
                        + "\n\nValid for 5 minutes."
        );
    }

    public void sendPasswordResetEmail(String email, String body) {
        sendEmail(
                email,
                "Reset Your NURTURE AI Password",
                body
        );
    }

    private void sendEmail(
            String email,
            String subject,
            String body) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(System.getenv("MAIL_USERNAME"));
        message.setTo(email);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }
}
