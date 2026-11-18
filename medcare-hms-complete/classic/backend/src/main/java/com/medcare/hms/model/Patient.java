package com.medcare.hms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Patient entity — maps to the `patients` table in PostgreSQL.
 */
@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Patient name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "blood_type", length = 3)
    private String bloodType;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    /** FK → Doctor assigned to this patient */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(length = 20)
    private String status = "Active";   // Active | Admitted | Discharged

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate v) { this.dob = v; }
    public String getBloodType() { return bloodType; }
    public void setBloodType(String v) { this.bloodType = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor v) { this.doctor = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}
