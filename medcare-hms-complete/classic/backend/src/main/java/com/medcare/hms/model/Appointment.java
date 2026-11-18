package com.medcare.hms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Appointment entity — maps to the `appointments` table.
 */
@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient is required")
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Doctor is required")
    private Doctor doctor;

    @Column(name = "appt_date", nullable = false)
    @NotNull(message = "Appointment date is required")
    private LocalDate apptDate;

    @Column(name = "appt_time", nullable = false)
    @NotNull(message = "Appointment time is required")
    private LocalTime apptTime;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(length = 20)
    private String status = "Scheduled";  // Scheduled | Completed | Cancelled

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient v) { this.patient = v; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor v) { this.doctor = v; }
    public LocalDate getApptDate() { return apptDate; }
    public void setApptDate(LocalDate v) { this.apptDate = v; }
    public LocalTime getApptTime() { return apptTime; }
    public void setApptTime(LocalTime v) { this.apptTime = v; }
    public String getReason() { return reason; }
    public void setReason(String v) { this.reason = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}
