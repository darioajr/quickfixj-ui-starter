package com.example.quickfixj.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@ConditionalOnProperty(name = "quickfixj-ui.internal.enabled", havingValue = "true")
@Configuration
public class WebConfig implements WebMvcConfigurer {

        @Override
        public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
                
        // CORS para WebSocket
        registry.addMapping("/ws/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

        @Override
        public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve os assets estáticos da UI React
        registry.addResourceHandler("/ui/assets/**")
                .addResourceLocations("classpath:/static/ui/assets/");
        
        registry.addResourceHandler("/ui/vite.svg")
                .addResourceLocations("classpath:/static/ui/");
    }
}