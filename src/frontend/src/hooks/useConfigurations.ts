import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import type { FixConfiguration } from '../types';

export const useConfigurations = () => {
  const [configurations, setConfigurations] = useState<FixConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getConfigurations();
      setConfigurations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConfiguration = useCallback(async (config: Omit<FixConfiguration, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await apiService.createConfiguration(config);
      await fetchConfigurations(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar configuração');
      throw err;
    }
  }, [fetchConfigurations]);

  const updateConfiguration = useCallback(async (configId: string, config: Partial<FixConfiguration>) => {
    try {
      await apiService.updateConfiguration(configId, config);
      await fetchConfigurations(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configuração');
      throw err;
    }
  }, [fetchConfigurations]);

  const deleteConfiguration = useCallback(async (configId: string) => {
    try {
      await apiService.deleteConfiguration(configId);
      await fetchConfigurations(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar configuração');
      throw err;
    }
  }, [fetchConfigurations]);

  const activateConfiguration = useCallback(async (configId: string) => {
    try {
      await apiService.activateConfiguration(configId);
      await fetchConfigurations(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ativar configuração');
    }
  }, [fetchConfigurations]);

  const deactivateConfiguration = useCallback(async (configId: string) => {
    try {
      await apiService.deactivateConfiguration(configId);
      await fetchConfigurations(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desativar configuração');
    }
  }, [fetchConfigurations]);

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  return {
    configurations,
    loading,
    error,
    refetch: fetchConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    activateConfiguration,
    deactivateConfiguration,
  };
};