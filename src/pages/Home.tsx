import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import FeaturedBanner from '@/components/content/FeaturedBanner';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContent } from '@/hooks/useContent';
import { useM3ULists } from '@/hooks/useM3ULists';
import { showSuccess, showError } from '@/utils/toast';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { 
    content, 
    favorites, 
    toggleFavorite, 
    isFavorite, 
    loading,
    getContinueWatching,
    getFavoritesContent,
    getTrendingContent,
    getContentByType,
    getMoviesByGenre,
    getSeriesByGenre,
    getLiveChannelsByCategory,
    getRandomContent
  } = useContent();
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

  // Dados reais organizados por categoria
  const realContent = {
    continueWatching: getContinueWatching(),
    myLions: getFavoritesContent(),
    trending: getTrendingContent(),
    actionMovies: getMoviesByGenre('ação') || getMoviesByGenre('action'),
    comedyMovies: getMoviesByGenre('comédia') || getMoviesByGenre('comedy'),
    dramaMovies: getMoviesByGenre('drama'),
    horrorMovies: getMoviesByGenre('terror') || getMoviesByGenre('horror'),
    romanceMovies: getMoviesByGenre('romance'),
    dramaSeries: getSeriesByGenre('drama'),
    comedySeries: getSeriesByGenre('comédia') || getSeriesByGenre('comedy'),
    scifiSeries: getSeriesByGenre('ficção') || getSeriesByGenre('sci-fi'),
    thrillerSeries: getSeriesByGenre('suspense') || getSeriesByGenre('thriller'),
    documentarySeries: getSeriesByGenre('documentário') || getSeriesByGenre('documentary'),
    newsChannels: getLiveChannelsByCategory('notícias') || getLiveChannelsByCategory('news'),
    sportsChannels: getLiveChannelsByCategory('esportes') || getLiveChannelsByCategory('sports'),
    entertainmentChannels: getLiveChannelsByCategory('entretenimento') || getLiveChannelsByCategory('entertainment'),
    moviesChannels: getLiveChannelsByCategory('filmes') || getLiveChannelsByCategory('movies'),
    allMovies: getContentByType('movie'),
    allSeries: getContentByType('series'),
    allLive: getContentByType('live'),
  };

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
          {/* Continuar Assistindo */}
          {realContent.continueWatching.length > 0 && (
            <ContentCarousel 
              title="Continuar Assistindo" 
              items={realContent.continueWatching}
              showAddButton={false}
            />
          )}
          
          {/* Meus Lions */}
          {realContent.myLions.length > 0 && (
            <ContentCarousel 
              title="Meus Lions" 
              items={realContent.myLions}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {/* Em Alta */}
          {realContent.trending.length > 0 && (
            <ContentCarousel 
              title="Em Alta na TV" 
              items={realContent.trending}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {/* Filmes por Gênero */}
          {realContent.actionMovies.length > 0 && (
            <ContentCarousel 
              title="Ação" 
              items={realContent.actionMovies}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.comedyMovies.length > 0 && (
            <ContentCarousel 
              title="Comédia" 
              items={realContent.comedyMovies}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.dramaMovies.length > 0 && (
            <ContentCarousel 
              title="Drama" 
              items={realContent.dramaMovies}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.horrorMovies.length > 0 && (
            <ContentCarousel 
              title="Terror" 
              items={realContent.horrorMovies}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.romanceMovies.length > 0 && (
            <ContentCarousel 
              title="Romance" 
              items={realContent.romanceMovies}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {/* Séries por Gênero */}
          {realContent.dramaSeries.length > 0 && (
            <ContentCarousel 
              title="Séries Dramáticas" 
              items={realContent.dramaSeries}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.comedySeries.length > 0 && (
            <ContentCarousel 
              title="Séries de Comédia" 
              items={realContent.comedySeries}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.scifiSeries.length > 0 && (
            <ContentCarousel 
              title="Ficção Científica" 
              items={realContent.scifiSeries}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.thrillerSeries.length > 0 && (
            <ContentCarousel 
              title="Suspense e Thriller" 
              items={realContent.thrillerSeries}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {/* Canais Ao Vivo por Categoria */}
          {realContent.newsChannels.length > 0 && (
            <ContentCarousel 
              title="Notícias" 
              items={realContent.newsChannels}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.sportsChannels.length > 0 && (
            <ContentCarousel 
              title="Esportes" 
              items={realContent.sportsChannels}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.entertainmentChannels.length > 0 && (
            <ContentCarousel 
              title="Entretenimento" 
              items={realContent.entertainmentChannels}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.moviesChannels.length > 0 && (
            <ContentCarousel 
              title="Canais de Filmes" 
              items={realContent.moviesChannels}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {/* Geral se não houver conteúdo específico */}
          {realContent.allMovies.length > 0 && realContent.actionMovies.length === 0 && (
            <ContentCarousel 
              title="Filmes Populares" 
              items={realContent.allMovies}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.allSeries.length > 0 && realContent.dramaSeries.length === 0 && (
            <ContentCarousel 
              title="Séries Populares" 
              items={realContent.allSeries}
              onAddToFavorites={handleAddToFavorites}
              isFavorite={isFavorite}
            />
          )}
          
          {realContent.allLive.length > 0 && realContent.newsChannels.length === 0 && (
            <ContentCarousel 
              title="Canais Ao Vivo" 
              items={realContent.allLive}
              showAddButton={false}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;