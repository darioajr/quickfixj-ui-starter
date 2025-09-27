import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import type { FixMessage, PaginatedResponse } from '../types';

export const useMessages = (sessionId?: string) => {
  const [messages, setMessages] = useState<FixMessage[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (page: number = 1, pageSize: number = 50) => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<FixMessage> = await apiService.getMessages(sessionId, page, pageSize);
      setMessages(response.data);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const sendMessage = useCallback(async (messageSessionId: string, messageType: string, fields: Record<string, string>) => {
    try {
      await apiService.sendMessage(messageSessionId, messageType, fields);
      await fetchMessages(pagination.page, pagination.pageSize); // Refresh current page
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
      throw err;
    }
  }, [fetchMessages, pagination.page, pagination.pageSize]);

  const changePage = useCallback((newPage: number) => {
    fetchMessages(newPage, pagination.pageSize);
  }, [fetchMessages, pagination.pageSize]);

  const changePageSize = useCallback((newPageSize: number) => {
    fetchMessages(1, newPageSize);
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    pagination,
    loading,
    error,
    refetch: () => fetchMessages(pagination.page, pagination.pageSize),
    sendMessage,
    changePage,
    changePageSize,
  };
};