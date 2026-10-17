package com.nurture.backend.family;

import java.time.LocalDateTime;

public record MotherFamilyMemberResponse(
        Long familyMemberId,
        String memberName,
        String relationship,
        Integer age,
        String phoneNumber,
        String email,
        LocalDateTime createdAt
) {
}