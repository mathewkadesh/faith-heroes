import { useCallback, useEffect, useState } from 'react';
import { signatureItemAPI } from '../lib/api';

const emptyData = { included: [], addons: [], all: [] };

export function useSignatureItems(characterId) {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(Boolean(characterId));
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!characterId) {
      setData(emptyData);
      setLoading(false);
      return Promise.resolve();
    }

    setLoading(true);
    setError(null);
    return signatureItemAPI
      .getByCharacter(characterId)
      .then(res => {
        setData(res.data || emptyData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Could not load signature items');
        setLoading(false);
      });
  }, [characterId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
