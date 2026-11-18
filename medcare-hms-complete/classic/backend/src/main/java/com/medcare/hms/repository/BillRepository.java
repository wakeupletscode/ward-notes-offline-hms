package com.medcare.hms.repository;

import com.medcare.hms.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByStatus(String status);
    List<Bill> findByPatientId(Long patientId);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Bill b WHERE b.status = 'Pending'")
    BigDecimal sumPendingAmount();

    long countByStatus(String status);
}
