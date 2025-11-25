import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus, Info, Volume2, VolumeX } from 'lucide-react';
import { useContent } from '@/hooks/useContent';

interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  backdrop: string;
  rating: string;
  year: number;
  duration: string;
  genre: string;
  type: 'movie' | 'series' | 'live';
}

const FeaturedBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const { getRandomContent } = useContent();

  // Obter conteúdo aleatório para o banner
  const featuredContent: FeaturedContent[] = getRandomContent(5).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || 'Descubra este conteúdo incrível disponível agora no Leão Live.',
    backdrop: item.thumbnail,
    rating: item.rating || 'L',
    year: item.year || new Date().getFullYear(),
    duration: item.duration || 'Varia',
    genre: item.genre || 'Geral',
    type: item.type
  }));

  useEffect(() => {
    if (featuredContent.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
      }, 8000);

      return () => clearInterval(timer);
    }
  }, [featuredContent.length]);

  if (featuredContent.length === 0) {
    return (
      <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black" />
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Bem-vindo ao Leão Live
              </h1>
              <p className="text-lg text-gray-200 mb-6">
                Configure sua lista M3U para acessar milhares de canais, filmes e séries.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-200 px-8 py-3"
                  onClick={() => window.location.href = '/m3u-management'}
                >
                  Configurar Lista M3U
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = featuredContent[currentIndex];

  const getTypeLabel = () => {
    switch (currentContent.type) {
      case 'movie': return 'Filme';
      case 'series': return 'Série';
      case 'live': return 'Canal Ao Vivo';
      default: return 'Conteúdo';
    }
  };

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-r from-black via-black/50 to-transparent" />
        <img 
          src={currentContent.backdrop}
          alt={currentContent.title}
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {currentContent.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-green-500 font-semibold">98% relevante</span>
              <span className="text-white">{currentContent.year}</span>
              <span className="text-white border border-white px-2 py-1 text-sm">
                {currentContent.rating}
              </span>
              <span className="text-white">{currentContent.duration}</span>
              <span className="text-white">{currentContent.genre}</span>
              <span className="text-white border border-white/50 px-2 py-1 text-sm">
                {getTypeLabel()}
              </span>
            </div>
            
            <p className="text-lg text-gray-200 mb-6 line-clamp-3">
              {currentContent.description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-200 px-8 py-3"
              >
                <Play className="mr-2 h-5 w-5" />
                Assistir
              </Button>
              
              <Button 
                size="lg" 
                className="bg-gray-200/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white hover:text-black px-8 py-3"
              >
                <Plus className="mr-2 h-5 w-5" />
                Adicionar aos Lions
              </Button>
              
              <Button 
                size="lg" 
                variant="ghost"
                className="text-white hover:bg-white/20 px-6 py-3"
              >
                <Info className="mr-2 h-5 w-5" />
                Mais Informações
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="text-white hover:bg-white/20"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
        
        {/* Dots Indicator */}
        <div className="flex space-x-2">
          {featuredContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBanner;