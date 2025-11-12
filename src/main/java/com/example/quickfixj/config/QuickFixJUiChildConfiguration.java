package com.example.quickfixj.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.example.quickfixj.controller.FixMessageController;
import com.example.quickfixj.controller.InfoController;
import com.example.quickfixj.controller.SessionsController;
import com.example.quickfixj.controller.SpaController;
import com.example.quickfixj.controller.WebSocketController;
import com.example.quickfixj.service.FixSessionMonitoringService;
import com.example.quickfixj.service.QuickFixJConfigReader;

@Configuration
@EnableAutoConfiguration
@ConditionalOnExpression("${quickfixj-ui.internal.enabled:false} && ${quickfixj-ui.monitoring.enabled:true}")
@EnableScheduling
@EnableConfigurationProperties({QuickFixJMonitoringProperties.class, QuickFixJUiProperties.class})
@Import({
    WebConfig.class,
    WebSocketConfig.class,
    StaticResourceConfig.class,
    CorsConfig.class,
    FixSessionMonitoringService.class,
    QuickFixJConfigReader.class,
    FixMessageController.class,
    InfoController.class,
    SessionsController.class,
    WebSocketController.class,
    SpaController.class
})
public class QuickFixJUiChildConfiguration {

    private static final Logger log = LoggerFactory.getLogger(QuickFixJUiChildConfiguration.class);

    @Bean
    WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> quickFixJUiWebServerFactoryCustomizer(
        QuickFixJUiProperties quickFixJUiProperties
    ) {
        return factory -> {
            int desiredPort = quickFixJUiProperties.getPort();
            log.info("Setting QuickFix/J UI child server port to {}", desiredPort);
            factory.setPort(desiredPort);
            // Context path será definido pela propriedade server.servlet.context-path
        };
    }
}
