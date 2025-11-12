package com.example.quickfixj.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@ConditionalOnProperty(name = "quickfixj-ui.internal.enabled", havingValue = "true")
public class InfoController {

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getApiInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "QuickFix/J UI API");
        info.put("version", "1.0.0");
        info.put("description", "Spring Boot Starter for FIX Protocol Session Management with React UI");
        info.put("timestamp", LocalDateTime.now().toString());
        
        // Check if frontend is available
        ClassPathResource frontendIndex = new ClassPathResource("frontend/dist/index.html");
        Map<String, Object> frontend = new HashMap<>();
        frontend.put("available", frontendIndex.exists());
        frontend.put("path", "/");
        frontend.put("fallback", "/static/index.html");
        info.put("frontend", frontend);
        
        Map<String, Object> endpoints = new HashMap<>();
    endpoints.put("sessions", "/api/fix/sessions/status");
    endpoints.put("startSession", "/api/fix/sessions/start");
    endpoints.put("stopSession", "/api/fix/sessions/stop");
        endpoints.put("loadProject", "/api/fix/config/load-project");
        endpoints.put("loadDirectory", "/api/fix/config/load-directory");
        endpoints.put("websocket", "/ws");
        info.put("endpoints", endpoints);
        
        info.put("features", new String[]{
            "Session monitoring",
            "Configuration reading", 
            "Real-time updates via WebSocket",
            "External project integration",
            "Embedded React UI"
        });
        
        // Build information
        Map<String, Object> build = new HashMap<>();
        build.put("frontend", "React + TypeScript + Vite");
        build.put("backend", "Spring Boot 3.2.0 + QuickFix/J 2.3.1");
        build.put("java", "21");
        info.put("build", build);
        
        return ResponseEntity.ok(info);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", java.time.Instant.now().toString()
        ));
    }
}