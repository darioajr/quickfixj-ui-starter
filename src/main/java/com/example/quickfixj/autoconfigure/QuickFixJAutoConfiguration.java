package com.example.quickfixj.autoconfigure;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import com.example.quickfixj.config.QuickFixJMonitoringProperties;
import com.example.quickfixj.config.QuickFixJUiProperties;

/**
 * Configuração automática para o QuickFIX/J UI Starter.
 * 
 * Esta configuração cria apenas componentes para MONITORAMENTO
 * de sessões QuickFIX/J existentes, não cria suas próprias sessões.
 */
@AutoConfiguration
@EnableConfigurationProperties({QuickFixJUiProperties.class, QuickFixJMonitoringProperties.class})
public class QuickFixJAutoConfiguration {

    @Bean
    @ConditionalOnExpression("${quickfixj-ui.enabled:true} && !${quickfixj-ui.internal.enabled:false}")
    public QuickFixJUiServerManager quickFixJUiServerManager(QuickFixJUiProperties properties) {
        return new QuickFixJUiServerManager(properties);
    }
}