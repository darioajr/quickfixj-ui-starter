import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  FixSession,
  FixConfiguration,
  FixMessage,
  SessionStatistics,
  FixAlert,
  ApiResponse,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptors para logging e tratamento de erros
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Métodos para Sessões FIX
  async getSessions(): Promise<FixSession[]> {
    const response: AxiosResponse<ApiResponse<FixSession[]>> = await this.api.get('/sessions');
    return response.data.data;
  }

  async getSession(sessionId: string): Promise<FixSession> {
    const response: AxiosResponse<ApiResponse<FixSession>> = await this.api.get(`/sessions/${sessionId}`);
    return response.data.data;
  }

  async startSession(sessionId: string): Promise<void> {
    await this.api.post(`/sessions/${sessionId}/start`);
  }

  async stopSession(sessionId: string): Promise<void> {
    await this.api.post(`/sessions/${sessionId}/stop`);
  }

  async resetSession(sessionId: string): Promise<void> {
    await this.api.post(`/sessions/${sessionId}/reset`);
  }

  // Métodos para Configurações
  async getConfigurations(): Promise<FixConfiguration[]> {
    const response: AxiosResponse<ApiResponse<FixConfiguration[]>> = await this.api.get('/configurations');
    return response.data.data;
  }

  async getConfiguration(configId: string): Promise<FixConfiguration> {
    const response: AxiosResponse<ApiResponse<FixConfiguration>> = await this.api.get(`/configurations/${configId}`);
    return response.data.data;
  }

  async createConfiguration(config: Omit<FixConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<FixConfiguration> {
    const response: AxiosResponse<ApiResponse<FixConfiguration>> = await this.api.post('/configurations', config);
    return response.data.data;
  }

  async updateConfiguration(configId: string, config: Partial<FixConfiguration>): Promise<FixConfiguration> {
    const response: AxiosResponse<ApiResponse<FixConfiguration>> = await this.api.put(`/configurations/${configId}`, config);
    return response.data.data;
  }

  async deleteConfiguration(configId: string): Promise<void> {
    await this.api.delete(`/configurations/${configId}`);
  }

  async activateConfiguration(configId: string): Promise<void> {
    await this.api.post(`/configurations/${configId}/activate`);
  }

  async deactivateConfiguration(configId: string): Promise<void> {
    await this.api.post(`/configurations/${configId}/deactivate`);
  }

  // Métodos para Mensagens FIX
  async getMessages(
    sessionId?: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResponse<FixMessage>> {
    const params = { page, pageSize, ...(sessionId && { sessionId }) };
    const response: AxiosResponse<PaginatedResponse<FixMessage>> = await this.api.get('/messages', { params });
    return response.data;
  }

  async getMessage(messageId: string): Promise<FixMessage> {
    const response: AxiosResponse<ApiResponse<FixMessage>> = await this.api.get(`/messages/${messageId}`);
    return response.data.data;
  }

  async sendMessage(sessionId: string, messageType: string, fields: Record<string, string>): Promise<FixMessage> {
    const response: AxiosResponse<ApiResponse<FixMessage>> = await this.api.post(`/sessions/${sessionId}/send`, {
      messageType,
      fields
    });
    return response.data.data;
  }

  // Métodos para Estatísticas
  async getSessionStatistics(sessionId: string): Promise<SessionStatistics> {
    const response: AxiosResponse<ApiResponse<SessionStatistics>> = await this.api.get(`/sessions/${sessionId}/statistics`);
    return response.data.data;
  }

  async getAllStatistics(): Promise<SessionStatistics[]> {
    const response: AxiosResponse<ApiResponse<SessionStatistics[]>> = await this.api.get('/statistics');
    return response.data.data;
  }

  // Métodos para Alertas
  async getAlerts(sessionId?: string): Promise<FixAlert[]> {
    const params = sessionId ? { sessionId } : {};
    const response: AxiosResponse<ApiResponse<FixAlert[]>> = await this.api.get('/alerts', { params });
    return response.data.data;
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.api.post(`/alerts/${alertId}/acknowledge`);
  }

  async clearAlerts(sessionId?: string): Promise<void> {
    const params = sessionId ? { sessionId } : {};
    await this.api.delete('/alerts', { params });
  }

  // Métodos utilitários
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  async getSystemInfo(): Promise<Record<string, unknown>> {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>>> = await this.api.get('/system/info');
    return response.data.data;
  }
}

export const apiService = new ApiService();