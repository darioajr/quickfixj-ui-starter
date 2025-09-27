package com.example.quickfixj.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Propriedades de configuração para monitoramento de sessões QuickFIX/J.
 * 
 * Este starter é apenas para MONITORAMENTO, não cria suas próprias sessões.
 */
@Configuration
@ConfigurationProperties(prefix = "quickfixj-ui.monitoring")
public class QuickFixJMonitoringProperties {
    
    /**
     * Habilita o monitoramento de sessões QuickFIX/J
     */
    private boolean enabled = true;
    
    /**
     * Intervalo de atualização do monitoramento em milissegundos
     */
    private long refreshInterval = 5000;
    
    /**
     * Diretórios para procurar configurações externas
     */
    private String[] externalConfigPaths = {};
    
    /**
     * Habilita notificações via WebSocket
     */
    private boolean webSocketNotifications = true;
    
    // Getters and Setters
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    public long getRefreshInterval() {
        return refreshInterval;
    }
    
    public void setRefreshInterval(long refreshInterval) {
        this.refreshInterval = refreshInterval;
    }
    
    public String[] getExternalConfigPaths() {
        return externalConfigPaths;
    }
    
    public void setExternalConfigPaths(String[] externalConfigPaths) {
        this.externalConfigPaths = externalConfigPaths;
    }
    
    public boolean isWebSocketNotifications() {
        return webSocketNotifications;
    }
    
    public void setWebSocketNotifications(boolean webSocketNotifications) {
        this.webSocketNotifications = webSocketNotifications;
    }
}