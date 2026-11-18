package com.medcare.hms.repository;

import com.medcare.hms.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    /** Search patients by name (case-insensitive) */
    List<Patient> findByNameContainingIgnoreCase(String name);

    /** Filter by status */
    List<Patient> findByStatus(String status);

    /** Patients assigned to a specific doctor */
    List<Patient> findByDoctorId(Long doctorId);

    /** Count by status for dashboard */
    long countByStatus(String status);
}
