import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreamOptimization {
  id: string;
  originalUrl: string;
  optimizedUrl: string;
  quality: string;
  codec: string;
  audioCodec: string;
  protocol: string;
  bandwidth: number;
  resolution: string;
}

interface StreamValidation {
  accessible: boolean;
  contentType: string;
  size?: string;
  lastModified?: string;
  isHLS: boolean;
  isMP4: boolean;
  isMPEGTS: boolean;
  error?: string;
}

export const useStreamOptimizer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeStream = useCallback(async (
    streamUrl: string, 
    quality: string = 'auto'
  ): Promise<StreamOptimization | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('stream-optimizer', {
        body: {
          action: 'optimize',
          streamUrl,
          quality
        }
      });

      if (functionError) throw functionError;

      // Transcodificar o stream
      const { data: transcodedData, error: transcodeError } = await supabase.functions.invoke('stream-optimizer', {
        body: {
          action: 'transcode',
          streamUrl,
          quality
        }
      });

      if (transcodeError) throw transcodeError;

      return {
        ...data.stream,
        optimizedUrl: transcodedData.stream
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateStream = useCallback(async (
    streamUrl: string
  ): Promise<StreamValidation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('stream-optimizer', {
        body: {
          action: 'validate',
          streamUrl
        }
      });

      if (functionError) throw functionError;

      return data.validation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePlaylist = useCallback(async (
    streamUrl: string,
    contentId: string,
    quality: string = 'auto'
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('stream-optimizer', {
        body: {
          action: 'generate-playlist',
          streamUrl,
          contentId,
          quality
        }
      });

      if (functionError) throw functionError;

      return data.playlist;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOptimalQuality = useCallback((deviceType: string, networkSpeed: number): string => {
    // Lógica para determinar qualidade ótima baseada no dispositivo e rede
    const qualityMatrix = {
      mobile: {
        slow: 'sd',
        medium: 'hd',
        fast: 'hd',
        ultra: 'fhd'
      },
      tablet: {
        slow: 'sd',
        medium: 'hd',
        fast: 'fhd',
        ultra: 'fhd'
      },
      desktop: {
        slow: 'hd',
        medium: 'fhd',
        fast: 'fhd',
        ultra: '4k'
      },
      tv: {
        slow: 'hd',
        medium: 'fhd',
        fast: '4k',
        ultra: '4k'
      }
    };

    const speedCategory = networkSpeed < 2 ? 'slow' : 
                        networkSpeed < 5 ? 'medium' : 
                        networkSpeed < 10 ? 'fast' : 'ultra';

    return qualityMatrix[deviceType as keyof typeof qualityMatrix]?.[speedCategory] || 'hd';
  }, []);

  const detectDeviceType = useCallback((): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod/.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet';
    } else if (/tv|smarttv|roku|chromecast/.test(userAgent)) {
      return 'tv';
    } else {
      return 'desktop';
    }
  }, []);

  const measureNetworkSpeed = useCallback(async (): Promise<number> => {
    // Medir velocidade da rede
    const startTime = Date.now();
    const testUrl = 'https://www.google.com/images/phd/px.gif';
    
    try {
      await fetch(testUrl, { cache: 'no-store' });
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // segundos
      
      // Estimar velocidade baseada no tempo de resposta
      if (duration < 0.5) return 10; // ultra fast
      if (duration < 1) return 5;  // fast
      if (duration < 2) return 2;  // medium
      return 1; // slow
    } catch {
      return 1; // slow por padrão
    }
  }, []);

  const autoOptimize = useCallback(async (streamUrl: string): Promise<StreamOptimization | null> => {
    const deviceType = detectDeviceType();
    const networkSpeed = await measureNetworkSpeed();
    const optimalQuality = getOptimalQuality(deviceType, networkSpeed);
    
    return optimizeStream(streamUrl, optimalQuality);
  }, [detectDeviceType, measureNetworkSpeed, getOptimalQuality, optimizeStream]);

  return {
    optimizeStream,
    validateStream,
    generatePlaylist,
    autoOptimize,
    getOptimalQuality,
    detectDeviceType,
    measureNetworkSpeed,
    isLoading,
    error
  };
};