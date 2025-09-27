package com.example.quickfixj.autoconfigure;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.example.quickfixj.config.QuickFixJMonitoringProperties;
import com.example.quickfixj.config.StaticResourceConfig;
import com.example.quickfixj.config.WebConfig;
import com.example.quickfixj.config.WebSocketConfig;
import com.example.quickfixj.controller.FixMessageController;
import com.example.quickfixj.controller.InfoController;
import com.example.quickfixj.controller.WebSocketController;
import com.example.quickfixj.service.FixSessionMonitoringService;
import com.example.quickfixj.service.QuickFixJConfigReader;

/**
 * Configuração automática para o QuickFIX/J UI Starter.
 * 
 * Esta configuração cria apenas componentes para MONITORAMENTO
 * de sessões QuickFIX/J existentes, não cria suas próprias sessões.
 */
@AutoConfiguration
@EnableConfigurationProperties(QuickFixJMonitoringProperties.class)
@ConditionalOnProperty(name = "quickfixj.monitoring.enabled", havingValue = "true", matchIfMissing = true)
@Import({WebConfig.class, WebSocketConfig.class})
@EnableScheduling
public class QuickFixJAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnClass(SimpMessagingTemplate.class)
    public FixSessionMonitoringService fixSessionMonitoringService(SimpMessagingTemplate messagingTemplate, 
                                                                   ApplicationContext applicationContext) {
        return new FixSessionMonitoringService(messagingTemplate, applicationContext);
    }

    @Bean
    @ConditionalOnMissingBean
    public QuickFixJConfigReader quickFixJConfigReader() {
        return new QuickFixJConfigReader();
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnWebApplication
    public FixMessageController fixMessageController(FixSessionMonitoringService sessionMonitoringService, 
                                                     QuickFixJConfigReader configReader) {
        return new FixMessageController(sessionMonitoringService, configReader);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnClass(SimpMessagingTemplate.class)
    public WebSocketController webSocketController() {
        return new WebSocketController();
    }



    @Bean
    @ConditionalOnMissingBean
    public InfoController infoController() {
        return new InfoController();
    }

    @Bean
    @ConditionalOnMissingBean
    public StaticResourceConfig staticResourceConfig() {
        return new StaticResourceConfig();
    }
}