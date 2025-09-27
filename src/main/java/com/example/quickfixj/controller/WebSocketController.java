package com.example.quickfixj.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    
    @MessageMapping("/subscribe")
    @SendTo("/topic/messages")
    public String subscribeToMessages(String message) {
        return "Subscribed to FIX messages";
    }
    
    @MessageMapping("/session-subscribe")
    @SendTo("/topic/session-status")
    public String subscribeToSessionStatus(String message) {
        return "Subscribed to session status updates";
    }
}