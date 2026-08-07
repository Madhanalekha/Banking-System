package com.gct.banking_system.controller;

import com.gct.banking_system.service.DatabaseStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SystemController {

    private final DatabaseStatusService databaseStatusService;

    @GetMapping("/health")
    public Map<String, Object> health() {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());

        return response;
    }

    @GetMapping("/health/db")
    public Map<String, Object> databaseHealth() {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("database", databaseStatusService.getDatabaseStatus());
        response.put("timestamp", LocalDateTime.now());

        return response;
    }

    @GetMapping("/info")
    public Map<String, Object> info() {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("application", "GCT Banking System");
        response.put("version", "1.0.0");
        response.put("developer", "GCT Training Program");
        response.put("java", System.getProperty("java.version"));

        return response;
    }

}