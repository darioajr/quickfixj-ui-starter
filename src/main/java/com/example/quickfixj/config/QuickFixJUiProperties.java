package com.example.quickfixj.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "quickfixj-ui")
public class QuickFixJUiProperties {

    /**
     * Enables the QuickFix/J UI server.
     */
    private boolean enabled = true;

    /**
     * HTTP port used by the QuickFix/J UI server when running in standalone mode.
     */
    private int port = 18080;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }
}
