package com.example.quickfixj.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import quickfix.ConfigError;
import quickfix.SessionID;
import quickfix.SessionSettings;

@Service
@ConditionalOnProperty(name = "quickfixj-ui.internal.enabled", havingValue = "true")
public class QuickFixJConfigReader {
    
    private static final Logger logger = LoggerFactory.getLogger(QuickFixJConfigReader.class);
    
    private final Map<String, SessionSettings> cachedConfigurations = new ConcurrentHashMap<>();
    
    /**
     * Lê configurações QuickFix/J de um diretório específico
     */
    public Map<String, SessionSettings> readConfigurationsFromDirectory(String directoryPath) {
        Map<String, SessionSettings> configurations = new HashMap<>();
        
        try {
            Path dir = Paths.get(directoryPath);
            if (!Files.exists(dir) || !Files.isDirectory(dir)) {
                logger.warn("Directory does not exist: {}", directoryPath);
                return configurations;
            }
            
            try (Stream<Path> paths = Files.walk(dir)) {
                paths.filter(Files::isRegularFile)
                     .filter(path -> path.toString().endsWith(".cfg") || path.toString().endsWith(".properties"))
                     .forEach(path -> {
                         try {
                             String fileName = path.getFileName().toString();
                             SessionSettings settings = new SessionSettings(path.toString());
                             configurations.put(fileName, settings);
                             logger.info("Loaded QuickFix/J configuration: {}", fileName);
                         } catch (ConfigError e) {
                             logger.error("Failed to load configuration from: {}", path, e);
                         }
                     });
            }
            
        } catch (IOException e) {
            logger.error("Error reading configurations from directory: {}", directoryPath, e);
        }
        
        return configurations;
    }
    
    /**
     * Lê configurações de um projeto QuickFix/J específico
     */
    public SessionSettings readProjectConfiguration(String projectPath) {
        String configKey = "project:" + projectPath;
        
        if (cachedConfigurations.containsKey(configKey)) {
            logger.debug("Returning cached configuration for project: {}", projectPath);
            return cachedConfigurations.get(configKey);
        }
        
        try {
            // Tenta encontrar arquivo de configuração no projeto
            List<String> possibleConfigFiles = Arrays.asList(
                projectPath + "/quickfixj.cfg",
                projectPath + "/src/main/resources/quickfixj.cfg",
                projectPath + "/config/quickfixj.cfg",
                projectPath + "/quickfix.cfg",
                projectPath + "/fix.cfg"
            );
            
            for (String configFile : possibleConfigFiles) {
                Path configPath = Paths.get(configFile);
                if (Files.exists(configPath)) {
                    SessionSettings settings = new SessionSettings(configFile);
                    cachedConfigurations.put(configKey, settings);
                    logger.info("Loaded project configuration from: {}", configFile);
                    return settings;
                }
            }
            
            // Se não encontrar, procura por arquivos .properties que possam conter configurações FIX
            Path projectDir = Paths.get(projectPath);
            if (Files.exists(projectDir)) {
                try (Stream<Path> paths = Files.walk(projectDir)) {
                    Optional<Path> propertiesFile = paths
                        .filter(Files::isRegularFile)
                        .filter(path -> path.toString().contains("application") && 
                                       path.toString().endsWith(".properties"))
                        .findFirst();
                        
                    if (propertiesFile.isPresent()) {
                        SessionSettings settings = createSettingsFromProperties(propertiesFile.get());
                        cachedConfigurations.put(configKey, settings);
                        logger.info("Created configuration from properties file: {}", propertiesFile.get());
                        return settings;
                    }
                }
            }
            
        } catch (Exception e) {
            logger.error("Error reading project configuration from: {}", projectPath, e);
        }
        
        logger.warn("No configuration found for project: {}, using default", projectPath);
        return createDefaultConfiguration();
    }
    
    /**
     * Cria configuração a partir de um arquivo properties
     */
    private SessionSettings createSettingsFromProperties(Path propertiesFile) throws ConfigError, IOException {
        Properties props = new Properties();
        props.load(Files.newInputStream(propertiesFile));
        
        SessionSettings settings = new SessionSettings();
        
        // Mapeia propriedades Spring Boot para configurações QuickFix/J
        String senderCompId = props.getProperty("quickfixj.sender-comp-id", "SENDER");
        String targetCompId = props.getProperty("quickfixj.target-comp-id", "TARGET");
        String host = props.getProperty("quickfixj.socket-connect-host", "localhost");
        String port = props.getProperty("quickfixj.socket-connect-port", "9876");
        String heartBeat = props.getProperty("quickfixj.heart-beat-interval", "30");
        
        // Configurações padrão
        settings.setString("ConnectionType", "initiator");
        settings.setString("BeginString", "FIX.4.4");
        settings.setString("SenderCompID", senderCompId);
        settings.setString("TargetCompID", targetCompId);
        settings.setString("SocketConnectHost", host);
        settings.setString("SocketConnectPort", port);
        settings.setString("HeartBtInt", heartBeat);
        settings.setString("StartTime", "00:00:00");
        settings.setString("EndTime", "00:00:00");
        settings.setString("UseDataDictionary", "Y");
        settings.setString("DataDictionary", "FIX44.xml");
        
        return settings;
    }
    
    /**
     * Monitora mudanças em arquivos de configuração
     */
    public void watchConfigurationChanges(String projectPath, Runnable onChangeCallback) {
        // Implementação simples - pode ser estendida com WatchService para monitoramento em tempo real
        new Thread(() -> {
            try {
                Path configPath = Paths.get(projectPath, "quickfixj.cfg");
                long lastModified = Files.exists(configPath) ? Files.getLastModifiedTime(configPath).toMillis() : 0;
                
                while (true) {
                    Thread.sleep(5000); // Verifica a cada 5 segundos
                    
                    if (Files.exists(configPath)) {
                        long currentModified = Files.getLastModifiedTime(configPath).toMillis();
                        if (currentModified > lastModified) {
                            logger.info("Configuration file changed: {}", configPath);
                            cachedConfigurations.remove("project:" + projectPath);
                            onChangeCallback.run();
                            lastModified = currentModified;
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("Error watching configuration changes for: {}", projectPath, e);
            }
        }).start();
    }
    
    /**
     * Extrai informações de sessão de uma configuração
     */
    public List<SessionInfo> extractSessionInfo(SessionSettings settings) {
        List<SessionInfo> sessions = new ArrayList<>();
        
        try {
            Iterator<SessionID> sessionIds = settings.sectionIterator();
            while (sessionIds.hasNext()) {
                SessionID sessionId = sessionIds.next();
                if (sessionId != null) {
                    SessionInfo info = new SessionInfo();
                    info.sessionId = sessionId.toString();
                    info.beginString = sessionId.getBeginString();
                    info.senderCompId = sessionId.getSenderCompID();
                    info.targetCompId = sessionId.getTargetCompID();
                    
                    // Extrai configurações específicas da sessão
                    try {
                        info.connectionType = settings.getString(sessionId, "ConnectionType");
                        info.host = settings.getString(sessionId, "SocketConnectHost");
                        info.port = settings.getInt(sessionId, "SocketConnectPort");
                        info.heartBeatInterval = settings.getInt(sessionId, "HeartBtInt");
                    } catch (Exception e) {
                        logger.debug("Some configuration values not found for session: {}", sessionId);
                    }
                    
                    sessions.add(info);
                }
            }
        } catch (Exception e) {
            logger.error("Error extracting session info", e);
        }
        
        return sessions;
    }
    
    private SessionSettings createDefaultConfiguration() {
        try {
            SessionSettings settings = new SessionSettings();
            settings.setString("ConnectionType", "initiator");
            settings.setString("BeginString", "FIX.4.4");
            settings.setString("SenderCompID", "SENDER");
            settings.setString("TargetCompID", "TARGET");
            settings.setString("SocketConnectHost", "localhost");
            settings.setString("SocketConnectPort", "9876");
            settings.setString("HeartBtInt", "30");
            settings.setString("StartTime", "00:00:00");
            settings.setString("EndTime", "00:00:00");
            return settings;
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to create default configuration", e);
        }
    }
    
    /**
     * Classe para armazenar informações de sessão
     */
    public static class SessionInfo {
        public String sessionId;
        public String beginString;
        public String senderCompId;
        public String targetCompId;
        public String connectionType;
        public String host;
        public int port;
        public int heartBeatInterval;
        
        @Override
        public String toString() {
            return String.format("Session[%s, %s->%s, %s:%d]", 
                sessionId, senderCompId, targetCompId, host, port);
        }
    }
}