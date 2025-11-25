import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Smartphone, 
  Tv, 
  Monitor, 
  Tablet,
  Wifi,
  WifiOff,
  Play,
  Settings
} from 'lucide-react';
import { useStreamOptimizer } from '@/hooks/useStreamOptimizer';
import { showSuccess, showError } from '@/utils/toast';

interface CompatibilityResult {
  feature: string;
  status: 'supported' | 'not-supported' | 'partial';
  description: string;
}

const StreamCompatibility: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CompatibilityResult[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [networkInfo, setNetworkInfo] = useState<any>({});
  
  const { validateStream, detectDeviceType, measureNetworkSpeed } = useStreamOptimizer();

  useEffect(() => {
    checkCompatibility();
  }, []);

  const checkCompatibility = async () => {
    setIsChecking(true);
    
    try {
      // Detectar informações do dispositivo
      const deviceType = detectDeviceType();
      const networkSpeed = await measureNetworkSpeed();
      
      setDeviceInfo({
        type: deviceType,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      });
      
      setNetworkInfo({
        speed: networkSpeed,
        online: navigator.onLine,
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      });

      // Verificar compatibilidade de recursos
      const compatibilityChecks: CompatibilityResult[] = [
        {
          feature: 'H.264 (AVC) Codec',
          status: checkH264Support(),
          description: 'Codec de vídeo padrão para streams SD/HD'
        },
        {
          feature: 'H.265 (HEVC) Codec',
          status: checkH265Support(),
          description: 'Codec de alta eficiência para 4K e Full HD'
        },
        {
          feature: 'AAC Audio Codec',
          status: checkAACSupport(),
          description: 'Codec de áudio universal para todos os streams'
        },
        {
          feature: 'AC3/E-AC3 Audio',
          status: checkAC3Support(),
          description: 'Áudio surround para conteúdo premium'
        },
        {
          feature: 'HLS Protocol',
          status: checkHLSSupport(),
          description: 'Protocolo de streaming padrão IPTV'
        },
        {
          feature: 'MPEG-TS Container',
          status: checkMPEGTSSupport(),
          description: 'Container para segmentos HLS'
        },
        {
          feature: 'MP4 Container',
          status: checkMP4Support(),
          description: 'Container para VOD direto'
        },
        {
          feature: 'DRM Support',
          status: checkDRMSupport(),
          description: 'Proteção de conteúdo (se necessário)'
        },
        {
          feature: 'Adaptive Streaming',
          status: checkAdaptiveStreaming(),
          description: 'Ajuste automático de qualidade'
        },
        {
          feature: 'Low Latency Mode',
          status: checkLowLatency(),
          description: 'Modo de baixa latência para live'
        }
      ];

      setResults(compatibilityChecks);
    } catch (error) {
      showError('Erro ao verificar compatibilidade');
    } finally {
      setIsChecking(false);
    }
  };

  const checkH264Support = (): 'supported' | 'not-supported' | 'partial' => {
    const video = document.createElement('video');
    return video.canPlayType('video/mp4; codecs="avc1.42E01E"') ? 'supported' : 'not-supported';
  };

  const checkH265Support = (): 'supported' | 'not-supported' | 'partial' => {
    const video = document.createElement('video');
    return video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"') ? 'supported' : 'partial';
  };

  const checkAACSupport = (): 'supported' | 'not-supported' | 'partial' => {
    const audio = document.createElement('audio');
    return audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') ? 'supported' : 'not-supported';
  };

  const checkAC3Support = (): 'supported' | 'not-supported' | 'partial' => {
    const audio = document.createElement('audio');
    return audio.canPlayType('audio/mp4; codecs="ac-3"') ? 'supported' : 'partial';
  };

  const checkHLSSupport = (): 'supported' | 'not-supported' | 'partial' => {
    // Verificar suporte nativo HLS
    const video = document.createElement('video');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      return 'supported';
    }
    
    // Verificar se HLS.js pode ser carregado
    return 'partial'; // Pode usar HLS.js como fallback
  };

  const checkMPEGTSSupport = (): 'supported' | 'not-supported' | 'partial' => {
    const video = document.createElement('video');
    return video.canPlayType('video/mp2t') ? 'supported' : 'partial';
  };

  const checkMP4Support = (): 'supported' | 'not-supported' | 'partial' => {
    const video = document.createElement('video');
    return video.canPlayType('video/mp4') ? 'supported' : 'not-supported';
  };

  const checkDRMSupport = (): 'supported' | 'not-supported' | 'partial' => {
    // Verificar suporte a DRM (Widevine, PlayReady, FairPlay)
    return (navigator as any).requestMediaKeySystemAccess ? 'partial' : 'not-supported';
  };

  const checkAdaptiveStreaming = (): 'supported' | 'not-supported' | 'partial' => {
    // Verificar suporte a streaming adaptativo
    return 'partial'; // Depende da implementação
  };

  const checkLowLatency = (): 'supported' | 'not-supported' | 'partial' => {
    // Verificar suporte a baixa latência
    return 'partial'; // Depende da implementação
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'supported':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'not-supported':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      supported: 'bg-green-500/20 text-green-400 border-green-500/30',
      'not-supported': 'bg-red-500/20 text-red-400 border-red-500/30',
      partial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };

    const labels = {
      supported: 'Suportado',
      'not-supported': 'Não Suportado',
      partial: 'Parcial'
    };

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status as keyof typeof labels]}</span>
      </Badge>
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'tv':
        return <Tv className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getNetworkIcon = (speed: number) => {
    if (speed > 5) return <Wifi className="h-4 w-4 text-green-500" />;
    if (speed > 2) return <Wifi className="h-4 w-4 text-yellow-500" />;
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const runTestStream = async () => {
    try {
      const testUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
      const validation = await validateStream(testUrl);
      
      if (validation?.accessible) {
        showSuccess('Stream de teste funcionando!');
      } else {
        showError('Stream de teste falhou');
      }
    } catch (error) {
      showError('Erro ao testar stream');
    }
  };

  const supportedCount = results.filter(r => r.status === 'supported').length;
  const partialCount = results.filter(r => r.status === 'partial').length;
  const notSupportedCount = results.filter(r => r.status === 'not-supported').length;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Compatibilidade IPTV</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-green-500 text-green-400">
              {supportedCount} Suportado
            </Badge>
            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
              {partialCount} Parcial
            </Badge>
            <Badge variant="outline" className="border-red-500 text-red-400">
              {notSupportedCount} Não Suportado
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Info */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            {getDeviceIcon(deviceInfo.type)}
            <div>
              <p className="text-sm font-medium">{deviceInfo.type?.toUpperCase()}</p>
              <p className="text-xs text-gray-400">{deviceInfo.platform}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getNetworkIcon(networkInfo.speed)}
            <div className="text-right">
              <p className="text-sm font-medium">{networkInfo.speed} Mbps</p>
              <p className="text-xs text-gray-400">{networkInfo.connection}</p>
            </div>
          </div>
        </div>

        {/* Compatibility Results */}
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium">{result.feature}</p>
                <p className="text-xs text-gray-400">{result.description}</p>
              </div>
              {getStatusBadge(result.status)}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkCompatibility}
            disabled={isChecking}
            className="border-gray-600 text-gray-300"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isChecking ? 'Verificando...' : 'Verificar Novamente'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runTestStream}
            className="border-gray-600 text-gray-300"
          >
            <Play className="h-4 w-4 mr-2" />
            Testar Stream
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreamCompatibility;