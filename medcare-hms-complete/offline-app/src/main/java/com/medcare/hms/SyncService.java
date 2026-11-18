package com.medcare.hms;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

/**
 * Field-level merge. The client sends: base (the server copy it last saw) + fields (only what it changed).
 *  - server field still equals base  -> nobody else touched it, apply the change
 *  - server field differs from base  -> real conflict: last-write-wins by client edit time, and report it
 */
@Service
public class SyncService {
    private final PatientRepository patients; private final AuditRepository audit; private long seq;

    SyncService(PatientRepository patients, AuditRepository audit) {
        this.patients = patients; this.audit = audit;
        this.seq = patients.findTopByOrderBySyncSeqDesc().map(p -> p.syncSeq).orElse(0L);
    }

    @SuppressWarnings("unchecked")
    @Transactional
    public synchronized Map<String, Object> sync(List<Map<String, Object>> changes, long since) {
        List<Object> results = new ArrayList<>();
        for (var c : changes) {
            String id = (String) c.get("id");
            var fields = (Map<String, Object>) c.getOrDefault("fields", Map.of());
            var base = (Map<String, Object>) c.getOrDefault("base", Map.of());
            long clientTime = ((Number) c.getOrDefault("clientTime", 0)).longValue();
            List<Map<String, String>> conflicts = new ArrayList<>();
            Patient p = patients.findById(id).orElse(null);
            if (p == null) {
                p = new Patient(); p.id = id;
                for (var f : Patient.FIELDS) p.set(f, str(fields.get(f)));
                audit.save(new AuditLog(id, "CREATE", str(fields.get("name"))));
            } else {
                for (var e : fields.entrySet()) {
                    if (!Patient.FIELDS.contains(e.getKey())) continue;
                    String f = e.getKey(), mine = str(e.getValue()), theirs = p.get(f), was = str(base.get(f));
                    if (Objects.equals(theirs, mine)) continue;
                    boolean untouched = Objects.equals(theirs, was);
                    if (untouched || clientTime >= p.updatedAt) {
                        p.set(f, mine);
                        if (!untouched) conflicts.add(conflict(f, mine, theirs, "yours"));
                    } else conflicts.add(conflict(f, mine, theirs, "theirs"));
                }
                audit.save(new AuditLog(id, "UPDATE", String.join(",", fields.keySet())));
            }
            if (Boolean.TRUE.equals(c.get("deleted"))) { p.deleted = true; audit.save(new AuditLog(id, "DELETE", "")); }
            p.rev++; p.updatedAt = System.currentTimeMillis(); p.syncSeq = ++seq;
            patients.save(p);
            if (!conflicts.isEmpty()) audit.save(new AuditLog(id, "CONFLICT", conflicts.toString()));
            results.add(Map.of("id", id, "record", p.toMap(), "conflicts", conflicts));
        }
        var updates = patients.findBySyncSeqGreaterThanOrderBySyncSeq(since).stream().map(Patient::toMap).toList();
        return Map.of("results", results, "updates", updates, "cursor", seq);
    }

    private static String str(Object o) { return o == null ? null : o.toString(); }
    private static Map<String, String> conflict(String f, String yours, String theirs, String kept) {
        var m = new HashMap<String, String>(); m.put("field", f); m.put("yours", yours); m.put("theirs", theirs); m.put("kept", kept); return m;
    }
}
