
package com.nurture.backend.doctor;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Doctor> findByDoctorIdAndUserId(
            Long doctorId,
            Long userId
    );
}
