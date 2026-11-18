package com.medcare.hms.controller;

import com.medcare.hms.model.Bill;
import com.medcare.hms.repository.BillRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * REST controller for Billing operations.
 * Base URL: /api/bills
 */
@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {

    @Autowired
    private BillRepository repo;

    @GetMapping
    public List<Bill> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pending")
    public List<Bill> pending() { return repo.findByStatus("Pending"); }

    @GetMapping("/patient/{patientId}")
    public List<Bill> byPatient(@PathVariable Long patientId) { return repo.findByPatientId(patientId); }

    /** GET /api/bills/summary — dashboard numbers */
    @GetMapping("/summary")
    public Map<String, Object> summary() {
        BigDecimal pending = repo.sumPendingAmount();
        return Map.of(
            "pendingCount",  repo.countByStatus("Pending"),
            "paidCount",     repo.countByStatus("Paid"),
            "pendingAmount", pending
        );
    }

    @PostMapping
    public ResponseEntity<Bill> create(@Valid @RequestBody Bill bill) {
        return ResponseEntity.status(201).body(repo.save(bill));
    }

    /** PATCH /api/bills/{id}/pay — mark a bill as paid */
    @PatchMapping("/{id}/pay")
    public ResponseEntity<Bill> markPaid(@PathVariable Long id) {
        return repo.findById(id).map(b -> {
            b.setStatus("Paid");
            return ResponseEntity.ok(repo.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
