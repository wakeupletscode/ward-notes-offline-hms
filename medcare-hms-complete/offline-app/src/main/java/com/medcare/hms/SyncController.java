package com.medcare.hms;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api")
public class SyncController {
    private final SyncService service; private final AuditRepository audit;
    SyncController(SyncService service, AuditRepository audit) { this.service = service; this.audit = audit; }

    @GetMapping("/health") public Map<String, String> health() { return Map.of("status", "ok"); }

    @SuppressWarnings("unchecked")
    @PostMapping("/sync")
    public Map<String, Object> sync(@RequestBody Map<String, Object> body) {
        var changes = (List<Map<String, Object>>) body.getOrDefault("changes", List.of());
        long since = ((Number) body.getOrDefault("since", 0)).longValue();
        return service.sync(changes, since);
    }

    @GetMapping("/audit")
    public List<Map<String, Object>> audit() {
        return audit.findTop50ByOrderByIdDesc().stream().map(a -> {
            var m = new LinkedHashMap<String, Object>();
            m.put("id", a.id); m.put("patientId", a.patientId); m.put("action", a.action); m.put("detail", a.detail); m.put("ts", a.ts);
            return (Map<String, Object>) m;
        }).toList();
    }
}
