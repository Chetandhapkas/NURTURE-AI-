package com.nurture.backend.family;

import java.time.LocalDateTime;

public interface MotherFamilyMemberProjection {

    Long getFamilyMemberId();

    String getMemberName();

    String getRelationship();

    Integer getAge();

    String getPhoneNumber();

    String getEmail();

    LocalDateTime getCreatedAt();
}