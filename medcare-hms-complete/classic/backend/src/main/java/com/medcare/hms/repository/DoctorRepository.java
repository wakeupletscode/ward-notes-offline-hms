package com.medcare.hms.repository;

import com.medcare.hms.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByOnDuty(boolean onDuty);
    List<Doctor> findBySpecialtyIgnoreCase(String specialty);
    long countByOnDuty(boolean onDuty);
}
