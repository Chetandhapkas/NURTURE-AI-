package com.nurture.backend.family;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class MotherFamilyJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public MotherFamilyJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<MotherFamilyMemberResponse> findByPatientUserId(
            Long patientUserId) {

        String sql = """
                SELECT
                    fm.family_member_id,
                    fm.member_name,
                    fm.relationship,
                    fm.age,
                    fm.phone_number,
                    u.email,
                    fm.created_at
                FROM public.family_members fm
                LEFT JOIN public.users u
                    ON u.user_id = fm.user_id
                WHERE fm.patient_user_id = ?
                ORDER BY fm.created_at DESC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapRow(rs),
                patientUserId
        );
    }

    private MotherFamilyMemberResponse mapRow(ResultSet rs)
            throws SQLException {

        Object ageValue = rs.getObject("age");

        Integer age = ageValue == null
                ? null
                : ((Number) ageValue).intValue();

        return new MotherFamilyMemberResponse(
                rs.getLong("family_member_id"),
                rs.getString("member_name"),
                rs.getString("relationship"),
                age,
                rs.getString("phone_number"),
                rs.getString("email"),
                rs.getTimestamp("created_at") == null
                        ? null
                        : rs.getTimestamp("created_at")
                        .toLocalDateTime()
        );
    }
}