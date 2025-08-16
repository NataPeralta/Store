import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [backendUrl] = useState('https://nataperalta.com.ar');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking');
        const response = await fetch(`${backendUrl}/api/products`, {
          method: 'GET',
          mode: 'cors',
        });
        
        if (response.ok) {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } catch (error) {
        console.error('Connection error:', error);
        setStatus('disconnected');
      }
    };

    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Verificando...',
          variant: 'secondary' as const,
        };
      case 'connected':
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: 'Conectado a Hostinger',
          variant: 'default' as const,
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: 'Desconectado',
          variant: 'destructive' as const,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.text}
      </Badge>
      <span className="hidden sm:inline">
        Backend: {backendUrl}
      </span>
    </div>
  );
}