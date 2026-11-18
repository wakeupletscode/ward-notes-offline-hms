package com.medcare.hms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

interface PatientRepository extends JpaRepository<Patient, String> {
    List<Patient> findBySyncSeqGreaterThanOrderBySyncSeq(long seq);
    Optional<Patient> findTopByOrderBySyncSeqDesc();
}
interface AuditRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop50ByOrderByIdDesc();
}
