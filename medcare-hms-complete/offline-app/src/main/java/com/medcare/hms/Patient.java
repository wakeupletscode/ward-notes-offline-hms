package com.medcare.hms;
import jakarta.persistence.*;
import java.util.*;

/** Synced entity. No Lombok: plain fields, same-package access. */
@Entity @Table(name = "patients")
public class Patient {
    public static final List<String> FIELDS = List.of("name", "dob", "blood", "phone", "status", "notes");
    @Id String id;                 // UUID created on the client, so records can be made offline
    String name, dob, blood, phone, status;
    @Column(length = 2000) String notes;
    long rev;                      // increments on every accepted change
    long syncSeq;                  // global change counter, clients pull "everything after N"
    long updatedAt;
    boolean deleted;               // soft delete so deletions can sync too

    String get(String f) { return switch (f) { case "name" -> name; case "dob" -> dob; case "blood" -> blood; case "phone" -> phone; case "status" -> status; default -> notes; }; }
    void set(String f, String v) { switch (f) { case "name" -> name = v; case "dob" -> dob = v; case "blood" -> blood = v; case "phone" -> phone = v; case "status" -> status = v; default -> notes = v; } }
    Map<String, Object> toMap() {
        var m = new LinkedHashMap<String, Object>();
        m.put("id", id); for (var f : FIELDS) m.put(f, get(f));
        m.put("rev", rev); m.put("syncSeq", syncSeq); m.put("updatedAt", updatedAt); m.put("deleted", deleted);
        return m;
    }
}
