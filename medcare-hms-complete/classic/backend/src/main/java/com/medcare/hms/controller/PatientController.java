package com.medcare.hms.controller;

import com.medcare.hms.model.Patient;
import com.medcare.hms.repository.PatientRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Patient CRUD operations.
 * Base URL: /api/patients
 */
@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")   // Allow requests from the HTML frontend
public class PatientController {

    @Autowired
    private PatientRepository repo;

    /** GET /api/patients — list all patients */
    @GetMapping
    public List<Patient> getAll() {
        return repo.findAll();
    }

    /** GET /api/patients/{id} — get one patient */
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/patients/search?name=priya — search by name */
    @GetMapping("/search")
    public List<Patient> search(@RequestParam String name) {
        return repo.findByNameContainingIgnoreCase(name);
    }

    /** GET /api/patients/status/{status} — filter by status */
    @GetMapping("/status/{status}")
    public List<Patient> byStatus(@PathVariable String status) {
        return repo.findByStatus(status);
    }

    /** POST /api/patients — create a new patient */
    @PostMapping
    public ResponseEntity<Patient> create(@Valid @RequestBody Patient patient) {
        Patient saved = repo.save(patient);
        return ResponseEntity.status(201).body(saved);
    }

    /** PUT /api/patients/{id} — update an existing patient */
    @PutMapping("/{id}")
    public ResponseEntity<Patient> update(@PathVariable Long id,
                                          @Valid @RequestBody Patient updated) {
        return repo.findById(id).map(p -> {
            p.setName(updated.getName());
            p.setDob(updated.getDob());
            p.setBloodType(updated.getBloodType());
            p.setPhone(updated.getPhone());
            p.setEmail(updated.getEmail());
            p.setDoctor(updated.getDoctor());
            p.setStatus(updated.getStatus());
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/patients/{id} — delete a patient */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
