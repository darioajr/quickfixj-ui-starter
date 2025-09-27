package com.example.quickfixj.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SessionStatusDto {
    
    @JsonProperty("sessionId")
    private String sessionId;
    
    @JsonProperty("connected")
    private boolean connected;
    
    @JsonProperty("loggedOn")
    private boolean loggedOn;
    
    @JsonProperty("senderCompID")
    private String senderCompID;
    
    @JsonProperty("targetCompID")
    private String targetCompID;
    
    @JsonProperty("lastMessageTime")
    private String lastMessageTime;
    
    @JsonProperty("messagesReceived")
    private long messagesReceived;
    
    @JsonProperty("messagesSent")
    private long messagesSent;
    
    // Constructors
    public SessionStatusDto() {}
    
    public SessionStatusDto(String sessionId, boolean connected, boolean loggedOn) {
        this.sessionId = sessionId;
        this.connected = connected;
        this.loggedOn = loggedOn;
    }
    
    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public boolean isConnected() {
        return connected;
    }
    
    public void setConnected(boolean connected) {
        this.connected = connected;
    }
    
    public boolean isLoggedOn() {
        return loggedOn;
    }
    
    public void setLoggedOn(boolean loggedOn) {
        this.loggedOn = loggedOn;
    }
    
    public String getSenderCompID() {
        return senderCompID;
    }
    
    public void setSenderCompID(String senderCompID) {
        this.senderCompID = senderCompID;
    }
    
    public String getTargetCompID() {
        return targetCompID;
    }
    
    public void setTargetCompID(String targetCompID) {
        this.targetCompID = targetCompID;
    }
    
    public String getLastMessageTime() {
        return lastMessageTime;
    }
    
    public void setLastMessageTime(String lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }
    
    public long getMessagesReceived() {
        return messagesReceived;
    }
    
    public void setMessagesReceived(long messagesReceived) {
        this.messagesReceived = messagesReceived;
    }
    
    public long getMessagesSent() {
        return messagesSent;
    }
    
    public void setMessagesSent(long messagesSent) {
        this.messagesSent = messagesSent;
    }
}