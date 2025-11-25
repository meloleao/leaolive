import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FeaturedBanner } from '@/components/content/FeaturedBanner';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContent } from '@/hooks/useContent';
import { showSuccess, showError } from '@/utils/toast';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { content, favorites, toggleFavorite, isFavorite, loading } = useContent();

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchClick = () => {
    // Implementar lógica de busca
    console.log('Abrir busca');
  };

  const handleAddToFavorites = async (contentId: string) => {
    try {
      await toggleFavorite(contentId);
      const action = isFavorite(contentId) ? 'removido dos' : 'adicionado aos';
      showSuccess(`Conteúdo ${action} Lions com sucesso!`);
    } catch (error) {
      showError('Erro ao gerenciar favoritos');
    }
  };

  // Dados mockados para demonstração enquanto não há conteúdo real
  const mockContent = {
    continueWatching: [
      { id: '1', title: 'Stranger Things', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '16', duration: '50min', type: 'series' as const },
      { id: '2', title: 'The Crown', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '14', duration: '1h', type: 'series' as const },
      { id: '3', title: 'Avatar 2', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '12', duration: '3h 12min', type: 'movie' as const },
    ],
    myLions: content.filter(item => isFavorite(item.id)).slice(0, 6),
    trending: content.slice(0, 6),
    movies: content.filter(item => item.type === 'movie').slice(0, 6),
    series: content.filter(item => item.type === 'series').slice(0, 6),
    live: content.filter(item => item.type === 'live').slice(0, 6),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        onMenuToggle={handleMenuToggle}
        onSearchClick={handleSearchClick}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className={`pt-20 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
        <FeaturedBanner />
        
        <div className="space-y-8 pb-8">
          <ContentCarousel 
            title="Continuar Assistindo" 
            items={mockContent.continueWatching}
            showAddButton={false}
          />
          
          <ContentCarousel 
            title="Meus Lions" 
            items={mockContent.myLions}
            onAddToFavorites={handleAddToFavorites}
            isFavorite={isFavorite}
          />
          
          <ContentCarousel 
            title="Em Alta na TV" 
            items={mockContent.trending}
            onAddToFavorites={handleAddToFavorites}
            isFavorite={isFavorite}
          />
          
          <ContentCarousel 
            title="Filmes Populares" 
            items={mockContent.movies}
            onAddToFavorites={handleAddToFavorites}
            isFavorite={isFavorite}
          />
          
          <ContentCarousel 
            title="Séries Dramáticas" 
            items={mockContent.series}
            onAddToFavorites={handleAddToFavorites}
            isFavorite={isFavorite}
          />
          
          <ContentCarousel 
            title="Canais Ao Vivo" 
            items={mockContent.live}
            showAddButton={false}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;