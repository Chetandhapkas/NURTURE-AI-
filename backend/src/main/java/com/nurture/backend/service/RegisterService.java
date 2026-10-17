
package com.nurture.backend.service;

import com.nurture.backend.dto.RegisterRequest;
import com.nurture.backend.entity.Login;
import com.nurture.backend.repository.LoginRepository;

import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class RegisterService {

    private final LoginRepository loginRepository;
    private final OtpService otpService;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$",
                    Pattern.CASE_INSENSITIVE);

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[6-9]\\d{9}$");

    public RegisterService(
            LoginRepository loginRepository,
            OtpService otpService
    ) {
        this.loginRepository = loginRepository;
        this.otpService = otpService;
    }

    public String register(RegisterRequest request) {

        // Check request
        if (request == null) {
            return "Registration details are required";
        }

        // Validate full name
        if (request.getFullName() == null
                || request.getFullName().trim().isEmpty()) {
            return "Full name is required";
        }

        if (request.getFullName().trim().length() < 2) {
            return "Full name must contain at least 2 characters";
        }

        // Validate email
        if (request.getEmail() == null
                || request.getEmail().trim().isEmpty()) {
            return "Email is required";
        }

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return "Please enter a valid email address";
        }

        // Validate OTP
        if (request.getOtp() == null
                || request.getOtp().trim().isEmpty()) {
            return "OTP is required";
        }

        // Validate password
        if (request.getPassword() == null
                || request.getPassword().trim().isEmpty()) {
            return "Password is required";
        }

        if (request.getPassword().length() < 6) {
            return "Password must contain at least 6 characters";
        }

        // Validate phone number when supplied
        String phone = request.getPhoneNumber();

        if (phone != null && !phone.trim().isEmpty()) {
            phone = phone.trim();

            if (!PHONE_PATTERN.matcher(phone).matches()) {
                return "Please enter a valid 10-digit Indian mobile number";
            }
        } else {
            phone = null;
        }

        // Validate role
        if (request.getRole() == null
                || request.getRole().trim().isEmpty()) {
            return "Role is required";
        }

        String role = request.getRole().trim();

        if (!role.equalsIgnoreCase("Mother")
                && !role.equalsIgnoreCase("Family Member")) {
            return "Invalid role. Select Mother or Family Member";
        }

        // Check whether email already exists
        if (loginRepository.findByEmail(email).isPresent()) {
            return "Email already exists";
        }

        // Verify OTP
        if (!otpService.verifyOtp(email, request.getOtp().trim())) {
            return "Invalid or Expired OTP";
        }

        // Create user
        Login user = new Login();

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);

        // IMPORTANT:
        // Store a securely hashed password here if your login
        // implementation uses BCryptPasswordEncoder.
        user.setPassword(request.getPassword());

        user.setPhoneNumber(phone);
        user.setRole(role);

        loginRepository.save(user);

        return "Registration Successful";
    }
}
