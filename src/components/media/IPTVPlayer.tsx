import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Settings,
  Loader2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  Tv
} from 'lucide-react';
import { useStreamOptimizer } from '@/hooks/useStreamOptimizer';
import { showSuccess, showError } from '@/utils/toast';

interface IPTVPlayerProps {
  streamUrl: string;
  title: string;
  type: 'live' | 'movie' | 'series';
  poster?: string;
  autoPlay?: boolean;
  onStreamEnd?: () => void;
  onError?: (error: string) => void;
}

const IPTVPlayer: React.FC<IPTVPlayerProps> = ({
  streamUrl,
  title,
  type,
  poster,
  autoPlay = false,
  onStreamEnd,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [networkStatus, setNetworkStatus] = useState<'good' | 'poor' | 'offline'>('good');
  const [deviceType, setDeviceType] = useState<string>('desktop');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['auto', '4k', 'fhd', 'hd', 'sd']);
  
  const { 
    optimizeStream, 
    validateStream, 
    autoOptimize, 
    detectDeviceType, 
    measureNetworkSpeed,
    isLoading: isOptimizing 
  } = useStreamOptimizer();

  useEffect(() => {
    // Detectar tipo de dispositivo
    const detectedDevice = detectDeviceType();
    setDeviceType(detectedDevice);

    // Inicializar player
    initializePlayer();
    
    // Monitorar status da rede
    const networkInterval = setInterval(checkNetworkStatus, 5000);
    
    return () => {
      clearInterval(networkInterval);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const initializePlayer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar stream
      const validation = await validateStream(streamUrl);
      if (!validation?.accessible) {
        throw new Error('Stream não acessível');
      }

      // Auto-otimizar baseado no dispositivo e rede
      const optimization = await autoOptimize(streamUrl);
      if (optimization) {
        loadStream(optimization.optimizedUrl);
      } else {
        loadStream(streamUrl);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao inicializar player';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
      showError(errorMessage);
    }
  };

  const loadStream = async (url: string) => {
    const video = videoRef.current;
    if (!video) return;

    // Carregar HLS.js se necessário
    if (url.includes('.m3u8') && !window.Hls) {
      await loadHLSJS();
    }

    if (url.includes('.m3u8') && window.Hls) {
      // Usar HLS.js para streams HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }


<dyad-write path="src/components/media/IPTVPlayer.tsx" description="Player IPTV corrigido">
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Settings,
  Loader2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  Tv
} from 'lucide-react';
import { useStreamOptimizer } from '@/hooks/useStreamOptimizer';
import { showSuccess, showError } from '@/utils/toast';

interface IPTVPlayerProps {
  streamUrl: string;
  title: string;
  type: 'live' | 'movie' | 'series';
  poster?: string;
  autoPlay?: boolean;
  onStreamEnd?: () => void;
  onError?: (error: string) => void;
}

const IPTVPlayer: React.FC<IPTVPlayerProps> = ({
  streamUrl,
  title,
  type,
  poster,
  autoPlay = false,
  onStreamEnd,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'good' | 'poor' | 'offline'>('good');
  const [deviceType, setDeviceType] = useState<string>('desktop');
  
  const { 
    validateStream, 
    detectDeviceType, 
    measureNetworkSpeed,
    isLoading: isOptimizing 
  } = useStreamOptimizer();

  useEffect(() => {
    // Detectar tipo de dispositivo
    const detectedDevice = detectDeviceType();
    setDeviceType(detectedDevice);

    // Inicializar player
    initializePlayer();
    
    // Monitorar status da rede
    const networkInterval = setInterval(checkNetworkStatus, 5000);
    
    return () => {
      clearInterval(networkInterval);
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const initializePlayer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar stream
      const validation = await validateStream(streamUrl);
      if (!validation?.accessible) {
        throw new Error('Stream não acessível');
      }

      loadStream(streamUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao inicializar player';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
      showError(errorMessage);
    }
  };

  const loadStream = async (url: string) => {
    const video = videoRef.current;
    if (!video) return;

    // Carregar HLS.js se necessário
    if (url.includes('.m3u8') && !window.Hls) {
      await loadHLSJS();
    }

    if (url.includes('.m3u8') && window.Hls) {
      // Usar HLS.js para streams HLS
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: type === 'live',
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play();
        }
      });

      hls.on(window.Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case window.Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case window.Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('Erro fatal no stream');
              setIsLoading(false);
              break;
          }
        }
      });

      hls.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = hls.levels[data.level];
        setCurrentQuality(`${level.height}p`);
      });

      hlsRef.current = hls;
    } else {
      // Usar player nativo para MP4
      video.src = url;
      video.load();
      
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play();
        }
      });
    }

    // Event listeners do vídeo
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));
    video.addEventListener('ended', () => {
      setIsPlaying(false);
      onStreamEnd?.();
    });
    video.addEventListener('timeupdate', () => setCurrentTime(video.currentTime));
    video.addEventListener('loadedmetadata', () => setDuration(video.duration));
    video.addEventListener('error', () => {
      setError('Erro ao carregar o vídeo');
      setIsLoading(false);
    });
  };

  const loadHLSJS = async () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const checkNetworkStatus = async () => {
    try {
      const speed = await measureNetworkSpeed();
      setNetworkStatus(speed > 2 ? 'good' : 'poor');
    } catch {
      setNetworkStatus('offline');
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleQualityChange = async (quality: string) => {
    setCurrentQuality(quality);
    showSuccess(`Qualidade alterada para ${quality}`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-3 w-3" />;
      case 'tablet':
        return <Monitor className="h-3 w-3" />;
      case 'tv':
        return <Tv className="h-3 w-3" />;
      default:
        return <Monitor className="h-3 w-3" />;
    }
  };

  const getNetworkIcon = () => {
    switch (networkStatus) {
      case 'good':
        return <Wifi className="h-3 w-3 text-green-400" />;
      case 'poor':
        return <Wifi className="h-3 w-3 text-yellow-400" />;
      case 'offline':
        return <WifiOff className="h-3 w-3 text-red-400" />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden">
      <CardContent className="p-0">
        {/* Video Container */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full"
            poster={poster}
            preload="metadata"
            playsInline
            crossOrigin="anonymous"
          />

          {/* Loading Overlay */}
          {(isLoading || isOptimizing) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                <p className="text-white text-sm">
                  {isOptimizing ? 'Otimizando stream...' : 'Carregando...'}
                </p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-white text-sm">{error}</p>
                <Button 
                  size="sm" 
                  onClick={initializePlayer}
                  className="mt-2 bg-red-600 hover:bg-red-700"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="absolute top-2 left-2 flex items-center space-x-2">
            <Badge variant="outline" className="bg-black/50 border-white/20 text-white text-xs">
              {getDeviceIcon()}
              <span className="ml-1">{deviceType}</span>
            </Badge>
            <Badge variant="outline" className="bg-black/50 border-white/20 text-white text-xs">
              {getNetworkIcon()}
            </Badge>
            {currentQuality !== 'auto' && (
              <Badge variant="outline" className="bg-black/50 border-white/20 text-white text-xs">
                <span className="font-bold">{currentQuality}</span>
              </Badge>
            )}
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Title */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium truncate">{title}</h3>
              
              {/* Quality Selector */}
              <select
                value={currentQuality}
                onChange={(e) => handleQualityChange(e.target.value)}
                className="bg-black/50 border border-white/20 text-white text-xs px-2 py-1 rounded"
              >
                {availableQualities.map((quality) => (
                  <option key={quality} value={quality}>
                    {quality.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Progress Bar */}
            {type !== 'live' && (
              <div className="mb-3">
                <div className="relative h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stream Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-400">
              <span>H.264/H.265</span>
              <span>AAC/AC3/E-AC3</span>
              <span>HLS</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                BOB Player
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                IPTV Ready
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IPTVPlayer;