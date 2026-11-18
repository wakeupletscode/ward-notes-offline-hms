package com.medcare.hms.controller;

import com.medcare.hms.model.Appointment;
import com.medcare.hms.repository.AppointmentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for Appointment CRUD operations.
 * Base URL: /api/appointments
 */
@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository repo;

    @GetMapping
    public List<Appointment> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/appointments/today — appointments for today */
    @GetMapping("/today")
    public List<Appointment> today() { return repo.findByApptDate(LocalDate.now()); }

    /** GET /api/appointments/date?date=2026-05-18 */
    @GetMapping("/date")
    public List<Appointment> byDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return repo.findByApptDate(date);
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> byPatient(@PathVariable Long patientId) {
        return repo.findByPatientId(patientId);
    }

    @PostMapping
    public ResponseEntity<Appointment> create(@Valid @RequestBody Appointment appt) {
        return ResponseEntity.status(201).body(repo.save(appt));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> update(@PathVariable Long id, @Valid @RequestBody Appointment updated) {
        return repo.findById(id).map(a -> {
            a.setPatient(updated.getPatient());
            a.setDoctor(updated.getDoctor());
            a.setApptDate(updated.getApptDate());
            a.setApptTime(updated.getApptTime());
            a.setReason(updated.getReason());
            a.setStatus(updated.getStatus());
            return ResponseEntity.ok(repo.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** PATCH /api/appointments/{id}/status?value=Completed */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestParam String value) {
        return repo.findById(id).map(a -> {
            a.setStatus(value);
            return ResponseEntity.ok(repo.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
