import { useState, useEffect, useCallback } from 'react';

// Hook générique pour les appels API
export const useApi = (apiCall, deps = [], immediate = true) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(...args);
      setData(response.data.data);
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Une erreur est survenue.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

// Hook pour les mutations (POST, PUT, DELETE)
export const useMutation = (apiCall) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(...args);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Une erreur est survenue.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
};

// Hook pour la pagination
export const usePagination = (apiCall, initialParams = {}) => {
  const [data, setData]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [params, setParams]     = useState({ page: 1, limit: 12, ...initialParams });

  const fetch = useCallback(async (newParams = {}) => {
    const merged = { ...params, ...newParams };
    setLoading(true);
    try {
      const response = await apiCall(merged);
      setData(response.data.data);
      setPagination(response.data.pagination);
      setParams(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetch(); }, []);

  return { data, pagination, loading, fetch, setParams };
};
