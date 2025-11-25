import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus, Info, Volume2, VolumeX } from 'lucide-react';

interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  backdrop: string;
  rating: string;
  year: number;
  duration: string;
  genre: string;
}

const featuredContent: FeaturedContent[] = [
  {
    id: '1',
    title: 'Aventura Espacial',
    description: 'Uma jornada épica através das galáxias enquanto a humanidade luta por sua sobrevivência contra forças desconhecidas.',
    backdrop: '/api/placeholder/1920/1080',
    rating: '16',
    year: 2024,
    duration: '2h 15min',
    genre: 'Ficção Científica'
  },
  {
    id: '2',
    title: 'Mistério na Floresta',
    description: 'Um detetive investiga desaparecimentos misteriosos em uma pequena cidade cercada por uma floresta antiga.',
    backdrop: '/api/placeholder/1920/1080',
    rating: '14',
    year: 2024,
    duration: '1h 48min',
    genre: 'Suspense'
  },
  {
    id: '3',
    title: 'Comédia Romântica',
    description: 'Dois estranhos se conhecem em um voo e descobrem que o amor pode surgir nos lugares mais inesperados.',
    backdrop: '/api/placeholder/1920/1080',
    rating: '12',
    year: 2024,
    duration: '1h 35min',
    genre: 'Comédia'
  }
];

export const FeaturedBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const currentContent = featuredContent[currentIndex];

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
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black px-8 py-3"
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