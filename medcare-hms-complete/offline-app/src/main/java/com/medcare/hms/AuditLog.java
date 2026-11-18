package com.medcare.hms;
import jakarta.persistence.*;

@Entity @Table(name = "audit_log")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    String patientId, action;
    @Column(length = 1000) String detail;
    long ts;
    protected AuditLog() {}
    AuditLog(String patientId, String action, String detail) { this.patientId = patientId; this.action = action; this.detail = detail; this.ts = System.currentTimeMillis(); }
}
