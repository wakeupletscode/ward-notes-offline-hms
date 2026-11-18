package com.medcare.hms.controller;

import com.medcare.hms.model.Doctor;
import com.medcare.hms.repository.DoctorRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Doctor CRUD operations.
 * Base URL: /api/doctors
 */
@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorRepository repo;

    @GetMapping
    public List<Doctor> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/on-duty")
    public List<Doctor> onDuty() { return repo.findByOnDuty(true); }

    @PostMapping
    public ResponseEntity<Doctor> create(@Valid @RequestBody Doctor doctor) {
        return ResponseEntity.status(201).body(repo.save(doctor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> update(@PathVariable Long id, @Valid @RequestBody Doctor updated) {
        return repo.findById(id).map(d -> {
            d.setName(updated.getName());
            d.setSpecialty(updated.getSpecialty());
            d.setPhone(updated.getPhone());
            d.setEmail(updated.getEmail());
            d.setOnDuty(updated.isOnDuty());
            return ResponseEntity.ok(repo.save(d));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** PATCH /api/doctors/{id}/toggle-duty — flip on/off duty */
    @PatchMapping("/{id}/toggle-duty")
    public ResponseEntity<Doctor> toggleDuty(@PathVariable Long id) {
        return repo.findById(id).map(d -> {
            d.setOnDuty(!d.isOnDuty());
            return ResponseEntity.ok(repo.save(d));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
