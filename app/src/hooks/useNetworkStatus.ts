import { useState, useEffect } from 'react';

/**
 * Hook simples para monitorar o status online/offline.
 * Retorna `true` quando o navegador está conectado à rede.
 */
export function useNetworkStatus() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleChange = () => setOnline(navigator.onLine);
    window.addEventListener('online', handleChange);
    window.addEventListener('offline', handleChange);
    return () => {
      window.removeEventListener('online', handleChange);
      window.removeEventListener('offline', handleChange);
    };
  }, []);

  return online;
}
