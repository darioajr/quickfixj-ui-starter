package com.example.quickfixj.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.quickfixj.dto.SessionStatusDto;
import com.example.quickfixj.service.FixSessionMonitoringService;
import com.example.quickfixj.service.QuickFixJConfigReader;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/fix")
@CrossOrigin(origins = "*")
@Tag(name = "QuickFix/J Monitoring API", description = "API for monitoring QuickFix/J sessions from external projects")
public class FixMessageController {
    
    private final FixSessionMonitoringService sessionMonitoringService;
    private final QuickFixJConfigReader configReader;
    
    public FixMessageController(FixSessionMonitoringService sessionMonitoringService, QuickFixJConfigReader configReader) {
        this.sessionMonitoringService = sessionMonitoringService;
        this.configReader = configReader;
    }
    
    @PostMapping("/sessions/refresh")
    @Operation(summary = "Refresh session monitoring", description = "Force a refresh of detected QuickFix/J sessions")
    public ResponseEntity<Map<String, String>> refreshSessions() {
        try {
            sessionMonitoringService.forceRefresh();
            return ResponseEntity.ok(Map.of("status", "success", "message", "Sessions refreshed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/sessions")
    @Operation(summary = "Get monitored sessions", description = "Get all currently detected QuickFix/J sessions from external projects")
    public ResponseEntity<List<SessionStatusDto>> getSessions() {
        try {
            List<SessionStatusDto> statuses = sessionMonitoringService.getSessionStatuses();
            return ResponseEntity.ok(statuses);
        } catch (Exception e) {
            // Log do erro para debug
            System.err.println("Erro ao buscar sessões: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping({"/sessions/status", "/session/status"})
    @Operation(summary = "Get session status", description = "Get the current status of all detected FIX sessions")
    public ResponseEntity<List<SessionStatusDto>> getSessionStatus() {
        List<SessionStatusDto> statuses = sessionMonitoringService.getSessionStatuses();
        return ResponseEntity.ok(statuses);
    }
    
    @PostMapping("/config/load-project")
    @Operation(summary = "Load configuration from project", description = "Load QuickFix/J configuration from another project")
    public ResponseEntity<Map<String, Object>> loadProjectConfiguration(@RequestParam String projectPath) {
        try {
            var sessionSettings = configReader.readProjectConfiguration(projectPath);
            var sessionInfos = configReader.extractSessionInfo(sessionSettings);
            
            return ResponseEntity.ok(Map.of(
                "status", "success", 
                "message", "Configuration loaded",
                "sessions", sessionInfos
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/config/load-directory")
    @Operation(summary = "Load configurations from directory", description = "Load all QuickFix/J configurations from a directory")
    public ResponseEntity<Map<String, Object>> loadDirectoryConfigurations(@RequestParam String directoryPath) {
        try {
            var configurations = configReader.readConfigurationsFromDirectory(directoryPath);
            
            return ResponseEntity.ok(Map.of(
                "status", "success", 
                "message", "Configurations loaded",
                "count", configurations.size(),
                "configurations", configurations.keySet()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Simple health check endpoint")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", java.time.LocalDateTime.now().toString(),
            "service", "QuickFix/J UI Monitoring"
        ));
    }
    
    @PostMapping("/config/monitor-project")
    @Operation(summary = "Monitor external project", description = "Monitor QuickFix/J sessions from an external project configuration")
    public ResponseEntity<Map<String, Object>> monitorProjectSessions(@RequestParam String projectPath) {
        try {
            var sessionSettings = configReader.readProjectConfiguration(projectPath);
            var sessionInfos = configReader.extractSessionInfo(sessionSettings);
            
            // Força uma atualização das sessões monitoradas
            sessionMonitoringService.forceRefresh();
            
            return ResponseEntity.ok(Map.of(
                "status", "success", 
                "message", "Project monitoring configured",
                "sessions", sessionInfos,
                "note", "Sessions will be automatically detected when they become active"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}