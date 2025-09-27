package com.example.quickfixj.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.quickfixj.dto.ApiResponse;
import com.example.quickfixj.dto.SessionStatusDto;
import com.example.quickfixj.service.FixSessionMonitoringService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SessionsController {

    private final FixSessionMonitoringService sessionMonitoringService;

    public SessionsController(FixSessionMonitoringService sessionMonitoringService) {
        this.sessionMonitoringService = sessionMonitoringService;
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<FixSessionDto>>> getSessions() {
        List<SessionStatusDto> statuses = sessionMonitoringService.getSessionStatuses();
        List<FixSessionDto> sessions = statuses.stream().map(FixSessionDto::fromStatus).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    // DTO compatível com o frontend
    public static class FixSessionDto {
        public String id;
        public String sessionID;
        public String targetCompID;
        public String senderCompID;
        public String status;
        public String connectionType = "INITIATOR";
        public boolean loggedIn;
        public java.util.Date creationTime = new java.util.Date();
        public java.util.Date lastMessageTime = new java.util.Date();
        public long messagesSent;
        public long messagesReceived;
        public long sequenceNumberSent = 0;
        public long sequenceNumberReceived = 0;
        public int heartbeatInterval = 30;
        public String version = "FIX.4.4";
        public String errorMessage = null;

        public static FixSessionDto fromStatus(SessionStatusDto status) {
            FixSessionDto dto = new FixSessionDto();
            dto.id = status.getSessionId();
            dto.sessionID = status.getSessionId();
            dto.targetCompID = status.getTargetCompID();
            dto.senderCompID = status.getSenderCompID();
            dto.status = status.isConnected() ? (status.isLoggedOn() ? "CONNECTED" : "DISCONNECTED") : "ERROR";
            dto.loggedIn = status.isLoggedOn();
            dto.messagesSent = status.getMessagesSent();
            dto.messagesReceived = status.getMessagesReceived();
            return dto;
        }
    }
}
