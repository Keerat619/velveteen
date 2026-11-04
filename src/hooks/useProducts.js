import { useEffect, useState } from 'react';
import { api, getApiError } from '../services/api.js';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api.get('/products', { signal: controller.signal })
      .then(({ data }) => {
        setProducts(Array.isArray(data.products) ? data.products : []);
        setError('');
      })
      .catch((requestError) => {
        if (requestError.name !== 'CanceledError') setError(getApiError(requestError, 'Products could not be loaded.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { products, loading, error, setProducts };
}
