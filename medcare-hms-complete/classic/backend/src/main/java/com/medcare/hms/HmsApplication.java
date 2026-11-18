package com.medcare.hms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MedCare Hospital Management System
 * Entry point for the Spring Boot application.
 *
 * Run with: mvn spring-boot:run
 * API base:  http://localhost:8080/api
 */
@SpringBootApplication
public class HmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(HmsApplication.class, args);
    }
}
