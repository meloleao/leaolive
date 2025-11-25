import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FeaturedBanner } from '@/components/content/FeaturedBanner';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContent } from '@/hooks/useContent';
import { useM3ULists } from '@/hooks/useM3ULists';
import { showSuccess, showError } from '@/utils/toast';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { content, favorites, toggleFavorite, isFavorite, loading } = useContent();
  const { lists } = useM3ULists();

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

  // Dados reais do conteúdo
  const realContent = {
    continueWatching: content.slice(0, 6),
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

  if (lists.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header onMenuToggle={handleMenuToggle} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className={`pt-20 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="text-center py-16">
              <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Leão Live</h1>
              <p className="text-xl text-gray-400 mb-8">
                Configure sua primeira lista M3U para começar a assistir
              </p>
              <Button 
                onClick={() => window.location.href = '/m3u-management'}
                className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
              >
                Configurar Lista M3U
              </Button>
            </div>
          </div>
        </main>
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
            items={realContent.continueWatching}
            showAddButton={false}
          />
          
          <ContentCarousel 
            title="Meus Lions" 
            items={realContent.myLions}
            onAddToFavorites={handleAddToFavorites}
            isFavorite={isFavorite}
          />
          
          <ContentCarousel 
            title="Em Alta na TV" 
            items={realContent.trending}
            onAddToFavorites={handleAddToFavorites}
            isFavorite={isFavorite}
          />
          
          <ContentCarousel 
            title="Filmes Populares" 
            items={realContent.movies}
            onAddToFavorites={handleAddToFavorites}
            isFavorite={isFavorite}
          />
          
          <ContentCarousel 
            title="Séries Dramáticas" 
            items={realContent.series}
            onAddToFavorites={handleAddToFavorites}
            isFavorite={isFavorite}
          />
          
          <ContentCarousel 
            title="Canais Ao Vivo" 
            items={realContent.live}
            showAddButton={false}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;