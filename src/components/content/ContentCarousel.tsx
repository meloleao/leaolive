import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Play, Info, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  year?: number;
  rating?: string;
  duration?: string;
  type: 'movie' | 'series' | 'live';
}

interface ContentCarouselProps {
  title: string;
  items: ContentItem[];
  showAddButton?: boolean;
  onAddToFavorites?: (contentId: string) => void;
  isFavorite?: (contentId: string) => boolean;
}

export const ContentCarousel = ({ 
  title, 
  items, 
  showAddButton = true,
  onAddToFavorites,
  isFavorite
}: ContentCarouselProps) => {
  const scrollContainer = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainer.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainer.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleAddToFavorites = (contentId: string) => {
    if (onAddToFavorites) {
      onAddToFavorites(contentId);
    }
  };

  return (
    <div className="relative group">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-8">
        {title}
      </h2>
      
      <div className="relative">
        {/* Left Scroll Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Right Scroll Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Content Container */}
        <div
          ref={scrollContainer}
          className="flex space-x-4 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-none group/item relative"
              style={{ width: '200px' }}
            >
              <div className="relative overflow-hidden rounded-md transition-transform duration-300 group-hover/item:scale-105">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-[300px] object-cover"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-white text-black hover:bg-gray-200 flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Assistir
                      </Button>
                      {showAddButton && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={`${
                            isFavorite && isFavorite(item.id)
                              ? 'bg-red-600 text-white border-red-600' 
                              : 'border-white text-white hover:bg-white hover:text-black'
                          }`}
                          onClick={() => handleAddToFavorites(item.id)}
                        >
                          {isFavorite && isFavorite(item.id) ? (
                            <Heart className="h-3 w-3 fill-current" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 w-full">
                      <Info className="h-3 w-3 mr-1" />
                      Mais Info
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <h3 className="text-white text-sm font-medium truncate">
                  {item.title}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  {item.year && <span>{item.year}</span>}
                  {item.rating && (
                    <>
                      <span>•</span>
                      <span className="border border-gray-600 px-1 py-0.5">
                        {item.rating}
                      </span>
                    </>
                  )}
                  {item.duration && (
                    <>
                      <span>•</span>
                      <span>{item.duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};