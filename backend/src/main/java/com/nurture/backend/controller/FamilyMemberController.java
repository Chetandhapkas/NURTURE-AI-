package com.nurture.backend.controller;

import com.nurture.backend.entity.FamilyMember;
import com.nurture.backend.entity.Login;
import com.nurture.backend.repository.FamilyMemberRepository;
import com.nurture.backend.repository.LoginRepository;
import com.nurture.backend.service.EmailService;
import com.nurture.backend.service.OtpService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/family-members")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "https://nurture-ai-frontend.vercel.app"
        },
        allowCredentials = "true"
)
public class FamilyMemberController {

    private final FamilyMemberRepository familyMemberRepository;
    private final LoginRepository loginRepository;
    private final OtpService otpService;
    private final EmailService emailService;

    public FamilyMemberController(
            FamilyMemberRepository familyMemberRepository,
            LoginRepository loginRepository,
            OtpService otpService,
            EmailService emailService
    ) {
        this.familyMemberRepository = familyMemberRepository;
        this.loginRepository = loginRepository;
        this.otpService = otpService;
        this.emailService = emailService;
    }


    // =========================================================
    // SEND OTP
    // =========================================================

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @RequestBody Map<String, Object> request
    ) {

        try {

            // -------------------------------------------------
            // GET REQUEST DATA
            // -------------------------------------------------

            Object familyMemberIdObject =
                    request.get("familyMemberId");

            Object patientEmailObject =
                    request.get("patientEmail");

            if (familyMemberIdObject == null) {

                return ResponseEntity
                        .badRequest()
                        .body("Family member ID is required.");
            }

            if (patientEmailObject == null) {

                return ResponseEntity
                        .badRequest()
                        .body("Mother's email is required.");
            }

            Long familyMemberUserId =
                    Long.valueOf(
                            familyMemberIdObject.toString()
                    );

            String patientEmail =
                    patientEmailObject
                            .toString()
                            .trim()
                            .toLowerCase();


            // -------------------------------------------------
            // CHECK FAMILY MEMBER LOGIN ACCOUNT
            // -------------------------------------------------

            Optional<Login> familyUser =
                    loginRepository.findById(
                            familyMemberUserId
                    );

            if (familyUser.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Family member account not found."
                        );
            }


            // -------------------------------------------------
            // CHECK FAMILY MEMBER ROLE
            // -------------------------------------------------

            String role =
                    familyUser.get().getRole();

            if (
                    role == null ||
                            (
                                    !role.equalsIgnoreCase("Family Member") &&
                                            !role.equalsIgnoreCase("FAMILY_MEMBER")
                            )
            ) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Only family members can connect to a pregnancy profile."
                        );
            }


            // -------------------------------------------------
            // CHECK IF PROFILE ALREADY EXISTS
            // -------------------------------------------------

            Optional<FamilyMember> existingProfile =
                    familyMemberRepository
                            .findByUserId(
                                    familyMemberUserId
                            );

            if (existingProfile.isPresent()) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                "Family member profile already exists. Please continue to your dashboard."
                        );
            }


            // -------------------------------------------------
            // FIND MOTHER
            // -------------------------------------------------

            Optional<Login> mother =
                    loginRepository
                            .findByEmail(
                                    patientEmail
                            );

            if (mother.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "No Nurture AI account found with this email address."
                        );
            }


            // -------------------------------------------------
            // CHECK MOTHER ROLE
            // -------------------------------------------------

            String motherRole =
                    mother.get().getRole();

            if (
                    motherRole == null ||
                            (
                                    !motherRole.equalsIgnoreCase("Mother") &&
                                            !motherRole.equalsIgnoreCase("MOTHER")
                            )
            ) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                "This email does not belong to a registered mother."
                        );
            }


            // -------------------------------------------------
            // OTP RATE LIMIT
            // -------------------------------------------------

            if (!otpService.canSendOtp(patientEmail)) {

                return ResponseEntity
                        .status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(
                                "Please wait 60 seconds before requesting another OTP."
                        );
            }


            // -------------------------------------------------
            // GENERATE OTP
            // -------------------------------------------------

            String otp =
                    otpService.generateOtp(
                            patientEmail
                    );


            System.out.println(
                    "========================================"
            );

            System.out.println(
                    "FAMILY MEMBER OTP GENERATED"
            );

            System.out.println(
                    "Family Member User ID: "
                            + familyMemberUserId
            );

            System.out.println(
                    "Mother Email: "
                            + patientEmail
            );

            System.out.println(
                    "OTP: "
                            + otp
            );

            System.out.println(
                    "========================================"
            );


            // -------------------------------------------------
            // SEND OTP TO MOTHER
            // -------------------------------------------------

            emailService.sendOtp(
                    patientEmail,
                    otp
            );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "OTP has been sent to the mother's registered email."
            );


            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to send OTP. Please try again."
                    );
        }
    }


    // =========================================================
    // VERIFY OTP
    // =========================================================

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, Object> request
    ) {

        try {

            // -------------------------------------------------
            // GET REQUEST DATA
            // -------------------------------------------------

            Object familyMemberIdObject =
                    request.get("familyMemberId");

            Object patientEmailObject =
                    request.get("patientEmail");

            Object otpObject =
                    request.get("otp");


            if (familyMemberIdObject == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Family member ID is required."
                        );
            }

            if (patientEmailObject == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Mother's email is required."
                        );
            }

            if (otpObject == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "OTP is required."
                        );
            }


            Long familyMemberUserId =
                    Long.valueOf(
                            familyMemberIdObject.toString()
                    );

            String patientEmail =
                    patientEmailObject
                            .toString()
                            .trim()
                            .toLowerCase();

            String otp =
                    otpObject
                            .toString()
                            .trim();


            // -------------------------------------------------
            // CHECK FAMILY MEMBER LOGIN ACCOUNT
            // -------------------------------------------------

            Optional<Login> familyUser =
                    loginRepository.findById(
                            familyMemberUserId
                    );

            if (familyUser.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Family member account not found."
                        );
            }


            // -------------------------------------------------
            // CHECK FAMILY MEMBER ROLE
            // -------------------------------------------------

            String familyRole =
                    familyUser.get().getRole();

            if (
                    familyRole == null ||
                            (
                                    !familyRole.equalsIgnoreCase("Family Member") &&
                                            !familyRole.equalsIgnoreCase("FAMILY_MEMBER")
                            )
            ) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Only family members can verify a pregnancy profile."
                        );
            }


            // -------------------------------------------------
            // FIND MOTHER
            // -------------------------------------------------

            Optional<Login> mother =
                    loginRepository
                            .findByEmail(
                                    patientEmail
                            );

            if (mother.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Mother's account not found."
                        );
            }


            // -------------------------------------------------
            // CHECK MOTHER ROLE
            // -------------------------------------------------

            String motherRole =
                    mother.get().getRole();

            if (
                    motherRole == null ||
                            (
                                    !motherRole.equalsIgnoreCase("Mother") &&
                                            !motherRole.equalsIgnoreCase("MOTHER")
                            )
            ) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                "This account is not registered as a mother."
                        );
            }


            // -------------------------------------------------
            // VERIFY OTP
            // -------------------------------------------------

            boolean verified =
                    otpService.verifyOtp(
                            patientEmail,
                            otp
                    );

            if (!verified) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                "Invalid or expired OTP."
                        );
            }


            // -------------------------------------------------
            // OTP VERIFIED
            // -------------------------------------------------

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "verified",
                    true
            );

            response.put(
                    "message",
                    "Mother's profile verified successfully."
            );

            response.put(
                    "patientUserId",
                    mother.get().getId()
            );

            response.put(
                    "patientName",
                    mother.get().getFullName()
            );

            response.put(
                    "patientEmail",
                    mother.get().getEmail()
            );

            response.put(
                    "familyMemberUserId",
                    familyMemberUserId
            );


            System.out.println(
                    "========================================"
            );

            System.out.println(
                    "MOTHER PROFILE VERIFIED"
            );

            System.out.println(
                    "Family Member User ID: "
                            + familyMemberUserId
            );

            System.out.println(
                    "Mother: "
                            + mother.get().getFullName()
            );

            System.out.println(
                    "Mother User ID: "
                            + mother.get().getId()
            );

            System.out.println(
                    "========================================"
            );


            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to verify OTP. Please try again."
                    );
        }
    }


    // =========================================================
    // CREATE FAMILY MEMBER PROFILE
    // =========================================================

    @PostMapping("/create-profile")
    public ResponseEntity<?> createProfile(
            @RequestBody Map<String, Object> request
    ) {

        try {

            // -------------------------------------------------
            // GET REQUEST DATA
            // -------------------------------------------------

            Object userIdObject =
                    request.get("userId");

            Object patientUserIdObject =
                    request.get("patientUserId");

            Object memberNameObject =
                    request.get("memberName");

            Object relationshipObject =
                    request.get("relationship");

            Object ageObject =
                    request.get("age");

            Object phoneNumberObject =
                    request.get("phoneNumber");


            // -------------------------------------------------
            // REQUIRED FIELD VALIDATION
            // -------------------------------------------------

            if (userIdObject == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "User ID is required."
                        );
            }

            if (patientUserIdObject == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Mother user ID is required."
                        );
            }

            if (memberNameObject == null ||
                    memberNameObject.toString().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Family member name is required."
                        );
            }


            // -------------------------------------------------
            // CONVERT DATA
            // -------------------------------------------------

            Long userId =
                    Long.valueOf(
                            userIdObject.toString()
                    );

            Long patientUserId =
                    Long.valueOf(
                            patientUserIdObject.toString()
                    );

            String memberName =
                    memberNameObject
                            .toString()
                            .trim();

            String relationship =
                    relationshipObject != null
                            ? relationshipObject
                            .toString()
                            .trim()
                            : null;

            Integer age = null;

            if (ageObject != null &&
                    !ageObject.toString().trim().isEmpty()) {

                age = Integer.valueOf(
                        ageObject.toString()
                );
            }

            String phoneNumber =
                    phoneNumberObject != null
                            ? phoneNumberObject
                            .toString()
                            .trim()
                            : null;


            // -------------------------------------------------
            // CHECK FAMILY MEMBER USER
            // -------------------------------------------------

            Optional<Login> familyUser =
                    loginRepository.findById(userId);

            if (familyUser.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Family member account not found."
                        );
            }


            // -------------------------------------------------
            // CHECK FAMILY MEMBER ROLE
            // -------------------------------------------------

            String familyRole =
                    familyUser.get().getRole();

            if (
                    familyRole == null ||
                            (
                                    !familyRole.equalsIgnoreCase("Family Member") &&
                                            !familyRole.equalsIgnoreCase("FAMILY_MEMBER")
                            )
            ) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Only family members can create a family profile."
                        );
            }


            // -------------------------------------------------
            // CHECK MOTHER
            // -------------------------------------------------

            Optional<Login> mother =
                    loginRepository.findById(
                            patientUserId
                    );

            if (mother.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Mother account not found."
                        );
            }


            // -------------------------------------------------
            // CHECK MOTHER ROLE
            // -------------------------------------------------

            String motherRole =
                    mother.get().getRole();

            if (
                    motherRole == null ||
                            (
                                    !motherRole.equalsIgnoreCase("Mother") &&
                                            !motherRole.equalsIgnoreCase("MOTHER")
                            )
            ) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                "Selected patient is not a registered mother."
                        );
            }


            // -------------------------------------------------
            // PREVENT DUPLICATE FAMILY PROFILE
            // -------------------------------------------------

            Optional<FamilyMember> existingProfile =
                    familyMemberRepository
                            .findByUserId(userId);

            if (existingProfile.isPresent()) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                "Family member profile already exists."
                        );
            }


            // -------------------------------------------------
            // CREATE FAMILY MEMBER
            // -------------------------------------------------

            FamilyMember familyMember =
                    new FamilyMember();

            familyMember.setUserId(userId);

            familyMember.setPatientUserId(
                    patientUserId
            );

            familyMember.setMemberName(
                    memberName
            );

            familyMember.setRelationship(
                    relationship
            );

            familyMember.setAge(
                    age
            );

            familyMember.setPhoneNumber(
                    phoneNumber
            );


            // -------------------------------------------------
            // SAVE DATABASE RECORD
            // -------------------------------------------------

            FamilyMember savedFamilyMember =
                    familyMemberRepository.save(
                            familyMember
                    );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Family member profile created successfully."
            );

            response.put(
                    "familyMemberId",
                    savedFamilyMember
                            .getFamilyMemberId()
            );

            response.put(
                    "userId",
                    savedFamilyMember
                            .getUserId()
            );

            response.put(
                    "patientUserId",
                    savedFamilyMember
                            .getPatientUserId()
            );

            response.put(
                    "memberName",
                    savedFamilyMember
                            .getMemberName()
            );

            response.put(
                    "relationship",
                    savedFamilyMember
                            .getRelationship()
            );

            response.put(
                    "age",
                    savedFamilyMember
                            .getAge()
            );

            response.put(
                    "phoneNumber",
                    savedFamilyMember
                            .getPhoneNumber()
            );


            System.out.println(
                    "========================================"
            );

            System.out.println(
                    "FAMILY MEMBER PROFILE CREATED"
            );

            System.out.println(
                    "Family Member ID: "
                            + savedFamilyMember
                            .getFamilyMemberId()
            );

            System.out.println(
                    "User ID: "
                            + savedFamilyMember
                            .getUserId()
            );

            System.out.println(
                    "Mother User ID: "
                            + savedFamilyMember
                            .getPatientUserId()
            );

            System.out.println(
                    "Name: "
                            + savedFamilyMember
                            .getMemberName()
            );

            System.out.println(
                    "Relationship: "
                            + savedFamilyMember
                            .getRelationship()
            );

            System.out.println(
                    "========================================"
            );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (NumberFormatException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid numeric value provided."
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to create family member profile."
                    );
        }
    }
}