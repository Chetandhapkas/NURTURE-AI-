package com.nurture.backend.service;

import com.nurture.backend.dto.LoginRequest;
import com.nurture.backend.entity.Login;
import com.nurture.backend.repository.FamilyMemberRepository;
import com.nurture.backend.repository.LoginRepository;
import com.nurture.backend.repository.PregnancyProfileRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final LoginRepository loginRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;
    private final FamilyMemberRepository familyMemberRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserService(
            LoginRepository loginRepository,
            PregnancyProfileRepository pregnancyProfileRepository,
            FamilyMemberRepository familyMemberRepository
    ) {
        this.loginRepository = loginRepository;
        this.pregnancyProfileRepository = pregnancyProfileRepository;
        this.familyMemberRepository = familyMemberRepository;
    }

    // LOGIN
    @Transactional
    public Login login(LoginRequest request) {

        if (request == null
                || request.getEmail() == null
                || request.getPassword() == null) {
            return null;
        }

        String email = request.getEmail().trim();

        Login user = loginRepository.findByEmail(email)
                .orElse(null);

        if (user == null || user.getPassword() == null) {
            return null;
        }

        String storedPassword = user.getPassword();
        String enteredPassword = request.getPassword();

        boolean passwordMatches;

        if (isBCryptPassword(storedPassword)) {

            passwordMatches = passwordEncoder.matches(
                    enteredPassword,
                    storedPassword
            );

        } else {

            // Compatibility for existing accounts whose passwords
            // were previously stored as plain text.
            passwordMatches = storedPassword.equals(enteredPassword);

            // Upgrade a successfully verified legacy password.
            if (passwordMatches) {
                user.setPassword(
                        passwordEncoder.encode(enteredPassword)
                );

                loginRepository.save(user);
            }
        }

        if (!passwordMatches) {
            return null;
        }

        return user;
    }

    private boolean isBCryptPassword(String password) {
        return password != null
                && (password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$"));
    }

    // CHECK MOTHER PROFILE
    public boolean isProfileCompleted(Long userId) {
        return pregnancyProfileRepository.existsByUser_Id(userId);
    }

    // CHECK FAMILY MEMBER VERIFICATION
    public boolean isFamilyVerified(Long userId) {
        return familyMemberRepository.existsByUserId(userId);
    }
}