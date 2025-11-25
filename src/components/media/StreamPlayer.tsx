import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Settings, 
  Tv,
  Film,
  Tv2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface StreamPlayerProps {
  streamUrl: string;
  title: string;
  type: 'live' | 'movie' | 'series';
  poster?: string;
  autoPlay?: boolean;
  onStreamEnd?: () => void;
}

interface QualityOption {
  label: string;
  value: string;
  bandwidth: number;
  resolution: string;
  codec: string;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({
  streamUrl,
  title,
  type,
  poster,
  autoPlay = false,
  onStreamEnd
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const qualities: QualityOption[] = [
    { label: 'Auto', value: 'auto', bandwidth: 0, resolution: 'Auto', codec: 'H.264/H.265' },
    { label: '4K', value: '4k', bandwidth: 25000000, resolution: '3840x2160', codec: 'H.265' },
    { label: 'Full HD', value: 'fhd', bandwidth: 6000000, resolution: '1920x1080', codec: 'H.265' },
    { label: 'HD', value: 'hd', bandwidth: 3000000, resolution: '1280x720', codec: 'H.264' },
    { label: 'SD', value: 'sd', bandwidth: 1500000, resolution: '640x480', codec: 'H.264' }
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onStreamEnd?.();
    };

    const handleError = () => {
      setError('Erro ao carregar o stream');
      setIsLoading(false);
      showError('Erro ao carregar o stream');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onStreamEnd]);

  const optimizeStream = async (quality: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-optimizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'optimize',
          streamUrl,
          quality
        })
      });

      const data = await response.json();

      if (data.success) {
        const optimizedUrl = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-optimizer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: 'transcode',
            streamUrl,
            quality
          })
        });

        const transcodedData = await optimizedUrl.json();

        if (transcodedData.success && videoRef.current) {
          videoRef.current.src = transcodedData.stream;
          videoRef.current.load();
          showSuccess(`Stream otimizado para ${quality}`);
        }
      }
    } catch (error) {
      setError('Falha ao otimizar stream');
      setIsLoading(false);
      showError('Falha ao otimizar stream');
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
    setIsPlaying(!isPlaying);
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

  const handleQualityChange = (quality: string) => {
    setCurrentQuality(quality);
    optimizeStream(quality);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
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

  const getTypeIcon = () => {
    switch (type) {
      case 'live':
        return <Tv className="h-4 w-4" />;
      case 'movie':
        return <Film className="h-4 w-4" />;
      case 'series':
        return <Tv2 className="h-4 w-4" />;
      default:
        return <Tv className="h-4 w-4" />;
    }
  };

  const getTypeBadge = () => {
    const variants = {
      live: 'bg-red-500/20 text-red-400 border-red-500/30',
      movie: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      series: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };

    const labels = {
      live: 'AO VIVO',
      movie: 'FILME',
      series: 'SÉRIE'
    };

    return (
      <Badge variant="outline" className={variants[type]}>
        {getTypeIcon()}
        <span className="ml-1">{labels[type]}</span>
      </Badge>
    );
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
          >
            <source src={streamUrl} type="application/x-mpegURL" />
            <source src={streamUrl} type="video/mp4" />
            Seu navegador não suporta este formato de vídeo.
          </video>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                <p className="text-white text-sm">Otimizando stream...</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-white text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Title and Type */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-medium truncate">{title}</h3>
                {getTypeBadge()}
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={currentQuality} onValueChange={handleQualityChange}>
                  <SelectTrigger className="w-24 bg-black/50 border-white/20 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualities.map((quality) => (
                      <SelectItem key={quality.value} value={quality.value} className="text-xs">
                        {quality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

                {/* Volume Slider */}
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
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
              <span>Codec: H.264/H.265</span>
              <span>Áudio: AAC/AC3/E-AC3</span>
              <span>Protocolo: HLS</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                Compatible
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

export default StreamPlayer;