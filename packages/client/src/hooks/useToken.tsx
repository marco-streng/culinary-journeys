import { useEffect, useState } from 'react';
import { getToken } from '../lib';

export const useToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      if (token) {
        setToken(token.toString());
      }
    };

    fetchToken();
  }, []);

  return token;
};
