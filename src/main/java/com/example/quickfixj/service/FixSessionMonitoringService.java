package com.example.quickfixj.service;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.quickfixj.dto.SessionStatusDto;

import quickfix.Acceptor;
import quickfix.Initiator;
import quickfix.Session;
import quickfix.SessionID;

/**
 * Serviço para monitoramento de sessões QuickFIX/J existentes.
 *
 * ✅ Detecta automaticamente sessões de projetos externos
 * ✅ Não cria suas próprias sessões QuickFIX/J
 * ✅ Lê dados do registry global do QuickFIX/J
 * ✅ Fornece endpoints REST para a UI React
 *
 * ❌ NÃO implementa quickfix.Application
 * ❌ NÃO cria SocketInitiator ou SocketAcceptor
 * ❌ NÃO gerencia conexões FIX
 * ❌ NÃO processa mensagens FIX diretamente
 */
@Service
@ConditionalOnProperty(name = "quickfixj-ui.internal.enabled", havingValue = "true")
public class FixSessionMonitoringService {

    private static final Logger logger = LoggerFactory.getLogger(FixSessionMonitoringService.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final SimpMessagingTemplate messagingTemplate;
    private final ApplicationContext applicationContext;
    private final Map<SessionID, SessionStatusDto> sessionStatuses = new ConcurrentHashMap<>();

    @Autowired
    public FixSessionMonitoringService(SimpMessagingTemplate messagingTemplate, ApplicationContext applicationContext) {
        this.messagingTemplate = messagingTemplate;
        this.applicationContext = applicationContext;
    }

    /**
     * Busca sessões ativas em projetos externos.
     */
    public List<SessionStatusDto> getSessionStatuses() {
        refreshSessionStatuses();
        return new ArrayList<>(sessionStatuses.values());
    }

    /**
     * Atualiza o status das sessões detectando sessões ativas no contexto Spring
     * e no registry global do QuickFIX/J.
     */
    @Scheduled(fixedRate = 5000)
    public void refreshSessionStatuses() {
        sessionStatuses.clear();

        scanCustomSessionProviders();
        scanQuickFixJRegistry();
        scanSpringContext();

        notifySessionUpdates();
    }

    private void scanCustomSessionProviders() {
        try {
            if (!applicationContext.containsBean("quickFixJSessionInfo")) {
                return;
            }

            Object provider = applicationContext.getBean("quickFixJSessionInfo");
            java.lang.reflect.Method getActiveSessionsMethod = provider.getClass().getMethod("getActiveSessions");
            Object sessionsObj = getActiveSessionsMethod.invoke(provider);

            if (!(sessionsObj instanceof Collection<?> sessions)) {
                logger.debug("quickFixJSessionInfo bean returned unexpected type: {}",
                        sessionsObj != null ? sessionsObj.getClass() : "null");
                return;
            }

            logger.info("quickFixJSessionInfo bean reported {} active session ids", sessions.size());

            for (Object sessionCandidate : sessions) {
                if (!(sessionCandidate instanceof SessionID sessionId)) {
                    continue;
                }

                Session session = resolveSessionFromProvider(provider, sessionId);
                SessionStatusDto statusDto = session != null
                        ? createSessionStatusFromSession(session)
                        : createFallbackStatus(sessionId);

                sessionStatuses.put(sessionId, statusDto);
            }

            logger.info("Imported {} sessions from quickFixJSessionInfo bean", sessions.size());
        } catch (NoSuchMethodException e) {
            logger.debug("quickFixJSessionInfo bean does not expose getActiveSessions(): {}", e.getMessage());
        } catch (Exception e) {
            logger.debug("Error using quickFixJSessionInfo bean: {}", e.getMessage());
        }
    }

    private Session resolveSessionFromProvider(Object provider, SessionID sessionId) {
        Session session = Session.lookupSession(sessionId);
        if (session != null) {
            return session;
        }

        try {
            java.lang.reflect.Method getSessionMethod = provider.getClass().getMethod("getSession", SessionID.class);
            Object sessionObj = getSessionMethod.invoke(provider, sessionId);
            if (sessionObj instanceof Session resolved) {
                return resolved;
            }
        } catch (Exception e) {
            logger.debug("quickFixJSessionInfo bean does not provide getSession(SessionID): {}", e.getMessage());
        }

        return null;
    }

    private void scanQuickFixJRegistry() {
        try {
            Field sessionsField = Session.class.getDeclaredField("sessions");
            sessionsField.setAccessible(true);
            Object rawSessions = sessionsField.get(null);
            if (!(rawSessions instanceof Map<?, ?> map)) {
                return;
            }

            @SuppressWarnings("unchecked")
            Map<SessionID, Session> sessions = (Map<SessionID, Session>) map;
            for (Map.Entry<SessionID, Session> entry : sessions.entrySet()) {
                sessionStatuses.put(entry.getKey(), createSessionStatusFromSession(entry.getValue()));
            }

            logger.debug("Found {} sessions from QuickFIX/J global registry", sessions.size());
        } catch (NoSuchFieldException e) {
            logger.debug("QuickFIX/J Session class does not expose static registry: {}", e.getMessage());
        } catch (IllegalAccessException e) {
            logger.debug("Could not access QuickFIX/J session registry: {}", e.getMessage());
        }
    }

    private void scanSpringContext() {
        try {
            Map<String, Initiator> initiators = applicationContext.getBeansOfType(Initiator.class);
            for (Map.Entry<String, Initiator> entry : initiators.entrySet()) {
                extractSessionsFromInitiator(entry.getKey(), entry.getValue());
            }

            Map<String, Acceptor> acceptors = applicationContext.getBeansOfType(Acceptor.class);
            for (Map.Entry<String, Acceptor> entry : acceptors.entrySet()) {
                extractSessionsFromAcceptor(entry.getKey(), entry.getValue());
            }

            logger.debug("Scanned Spring context: {} initiators, {} acceptors", initiators.size(), acceptors.size());
        } catch (Exception e) {
            logger.debug("Error scanning Spring context: {}", e.getMessage());
        }
    }

    private void extractSessionsFromInitiator(String beanName, Initiator initiator) {
        try {
            for (SessionID sessionId : initiator.getSessions()) {
                Session session = Session.lookupSession(sessionId);
                SessionStatusDto statusDto = session != null
                        ? createSessionStatusFromSession(session)
                        : createFallbackStatus(sessionId);
                statusDto.setSessionId(sessionId + " (Initiator:" + beanName + ")");
                sessionStatuses.put(sessionId, statusDto);
            }
        } catch (Exception e) {
            logger.debug("Could not extract sessions from initiator {}: {}", beanName, e.getMessage());
        }
    }

    private void extractSessionsFromAcceptor(String beanName, Acceptor acceptor) {
        try {
            for (SessionID sessionId : acceptor.getSessions()) {
                Session session = Session.lookupSession(sessionId);
                SessionStatusDto statusDto = session != null
                        ? createSessionStatusFromSession(session)
                        : createFallbackStatus(sessionId);
                statusDto.setSessionId(sessionId + " (Acceptor:" + beanName + ")");
                sessionStatuses.put(sessionId, statusDto);
            }
        } catch (Exception e) {
            logger.debug("Could not extract sessions from acceptor {}: {}", beanName, e.getMessage());
        }
    }

    private SessionStatusDto createSessionStatusFromSession(Session session) {
        SessionID sessionId = session.getSessionID();

        SessionStatusDto statusDto = new SessionStatusDto();
        statusDto.setSessionId(sessionId.toString());
        statusDto.setConnected(session.isEnabled());
        statusDto.setLoggedOn(session.isLoggedOn());
        statusDto.setSenderCompID(sessionId.getSenderCompID());
        statusDto.setTargetCompID(sessionId.getTargetCompID());
        statusDto.setLastMessageTime(LocalDateTime.now().format(DATE_TIME_FORMATTER));
        statusDto.setMessagesReceived(0);
        statusDto.setMessagesSent(0);

        return statusDto;
    }

    private SessionStatusDto createFallbackStatus(SessionID sessionId) {
        SessionStatusDto statusDto = new SessionStatusDto();
        statusDto.setSessionId(sessionId.toString());
        statusDto.setConnected(false);
        statusDto.setLoggedOn(false);
        statusDto.setSenderCompID(sessionId.getSenderCompID());
        statusDto.setTargetCompID(sessionId.getTargetCompID());
        statusDto.setLastMessageTime(null);
        statusDto.setMessagesReceived(0);
        statusDto.setMessagesSent(0);

        return statusDto;
    }

    private void notifySessionUpdates() {
        for (SessionStatusDto status : sessionStatuses.values()) {
            messagingTemplate.convertAndSend("/topic/session-status", status);
        }

        messagingTemplate.convertAndSend("/topic/sessions", new ArrayList<>(sessionStatuses.values()));
    }

    public void forceRefresh() {
        refreshSessionStatuses();
        logger.info("Forced refresh of session statuses, found {} sessions", sessionStatuses.size());
    }
}