package com.medcare.hms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Bill entity — maps to the `bills` table.
 */
@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient is required")
    private Patient patient;

    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @Column(name = "bill_type", length = 50)
    private String billType;   // Consultation | Surgery | Lab Tests | Medication | Room Charges

    @Column(length = 20)
    private String status = "Pending";  // Pending | Paid

    @Column(name = "bill_date")
    private LocalDate billDate = LocalDate.now();

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient v) { this.patient = v; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public String getBillType() { return billType; }
    public void setBillType(String v) { this.billType = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public LocalDate getBillDate() { return billDate; }
    public void setBillDate(LocalDate v) { this.billDate = v; }
}
