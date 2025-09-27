import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import type { FixSession } from '../types';

export const useSessions = () => {
  const [sessions, setSessions] = useState<FixSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = useCallback(async (sessionId: string) => {
    try {
      await apiService.startSession(sessionId);
      await fetchSessions(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar sessão');
    }
  }, [fetchSessions]);

  const stopSession = useCallback(async (sessionId: string) => {
    try {
      await apiService.stopSession(sessionId);
      await fetchSessions(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao parar sessão');
    }
  }, [fetchSessions]);

  const resetSession = useCallback(async (sessionId: string) => {
    try {
      await apiService.resetSession(sessionId);
      await fetchSessions(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resetar sessão');
    }
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    startSession,
    stopSession,
    resetSession,
  };
};