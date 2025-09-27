package com.example.quickfixj.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FixMessageDto {
    
    @JsonProperty("msgType")
    private String msgType;
    
    @JsonProperty("senderCompID")
    private String senderCompID;
    
    @JsonProperty("targetCompID")
    private String targetCompID;
    
    @JsonProperty("msgSeqNum")
    private int msgSeqNum;
    
    @JsonProperty("sendingTime")
    private String sendingTime;
    
    @JsonProperty("rawMessage")
    private String rawMessage;
    
    @JsonProperty("fields")
    private java.util.Map<String, String> fields;
    
    // Constructors
    public FixMessageDto() {}
    
    public FixMessageDto(String msgType, String senderCompID, String targetCompID) {
        this.msgType = msgType;
        this.senderCompID = senderCompID;
        this.targetCompID = targetCompID;
        this.fields = new java.util.HashMap<>();
    }
    
    // Getters and Setters
    public String getMsgType() {
        return msgType;
    }
    
    public void setMsgType(String msgType) {
        this.msgType = msgType;
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
    
    public int getMsgSeqNum() {
        return msgSeqNum;
    }
    
    public void setMsgSeqNum(int msgSeqNum) {
        this.msgSeqNum = msgSeqNum;
    }
    
    public String getSendingTime() {
        return sendingTime;
    }
    
    public void setSendingTime(String sendingTime) {
        this.sendingTime = sendingTime;
    }
    
    public String getRawMessage() {
        return rawMessage;
    }
    
    public void setRawMessage(String rawMessage) {
        this.rawMessage = rawMessage;
    }
    
    public java.util.Map<String, String> getFields() {
        return fields;
    }
    
    public void setFields(java.util.Map<String, String> fields) {
        this.fields = fields;
    }
}