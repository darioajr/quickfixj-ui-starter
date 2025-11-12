package com.example.quickfixj.autoconfigure;

import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.SmartLifecycle;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.Assert;

import com.example.quickfixj.config.QuickFixJUiChildConfiguration;
import com.example.quickfixj.config.QuickFixJUiProperties;

public class QuickFixJUiServerManager implements SmartLifecycle {

    private static final Logger log = LoggerFactory.getLogger(QuickFixJUiServerManager.class);

    private final QuickFixJUiProperties properties;

    private final AtomicBoolean running = new AtomicBoolean(false);

    private ConfigurableApplicationContext childContext;

    public QuickFixJUiServerManager(QuickFixJUiProperties properties) {
        this.properties = properties;
    }

    @Override
    public void start() {
        if (!properties.isEnabled()) {
            log.info("QuickFix/J UI server is disabled (quickfixj-ui.enabled=false)");
            return;
        }
        if (running.get()) {
            return;
        }

        Assert.isTrue(properties.getPort() > 0, "quickfixj-ui.port must be greater than 0");

        log.info("Starting QuickFix/J UI server on port {}", properties.getPort());

        Map<String, Object> childProperties = Map.of(
            "server.port", String.valueOf(properties.getPort()),
            "server.servlet.context-path", "",
            "spring.main.banner-mode", "off",
            "quickfixj-ui.internal.enabled", "true"
        );

        this.childContext = new SpringApplicationBuilder(QuickFixJUiChildConfiguration.class)
            .web(WebApplicationType.SERVLET)
            .initializers(applicationContext ->
                applicationContext.getEnvironment().getPropertySources().addFirst(
                    new MapPropertySource("quickfixjUiChildOverrides", childProperties)
                )
            )
            .registerShutdownHook(false)
            .run();

        running.set(true);
        log.info("QuickFix/J UI server started on port {}", properties.getPort());
    }

    @Override
    public void stop() {
        if (!running.get()) {
            return;
        }
        childContext.close();
        running.set(false);
        childContext = null;
        log.info("QuickFix/J UI server stopped");
    }

    @Override
    public boolean isRunning() {
        return running.get();
    }

    @Override
    public boolean isAutoStartup() {
        return true;
    }

    @Override
    public int getPhase() {
        return Integer.MAX_VALUE;
    }
}
