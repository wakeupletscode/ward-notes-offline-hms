package com.medcare.hms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Doctor entity — maps to the `doctors` table.
 */
@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Doctor name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Specialty is required")
    @Column(length = 80)
    private String specialty;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "on_duty")
    private boolean onDuty = true;

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String v) { this.specialty = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public boolean isOnDuty() { return onDuty; }
    public void setOnDuty(boolean v) { this.onDuty = v; }
}
