import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, Play, Info, Grid, List, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContent } from '@/hooks/useContent';
import { showSuccess, showError } from '@/utils/toast';

const MyLions = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const isMobile = useIsMobile();
  const { content, toggleFavorite, isFavorite, getFavoritesContent } = useContent();

  const favoritesContent = getFavoritesContent();
  
  // Filtrar favoritos
  const filteredFavorites = favoritesContent.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por tipo
  const favoriteMovies = filteredFavorites.filter(item => item.type === 'movie');
  const favoriteSeries = filteredFavorites.filter(item => item.type === 'series');
  const favoriteLive = filteredFavorites.filter(item => item.type === 'live');

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleRemoveFromFavorites = async (contentId: string) => {
    try {
      await toggleFavorite(contentId);
      showSuccess('Removido dos Lions com sucesso!');
    } catch (error) {
      showError('Erro ao remover dos favoritos');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onMenuToggle={handleMenuToggle} />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className={`pt-20 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
        <div className="container mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              <h1 className="text-3xl font-bold">Meus Lions</h1>
              <Badge variant="outline" className="border-red-500 text-red-400">
                {favoritesContent.length} itens
              </Badge>
            </div>
            
            {/* Busca e visualização */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar nos Lions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="flex bg-gray-800 border border-gray-700 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="text-white"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="text-white"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {favoritesContent.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Sua lista de Lions está vazia</h2>
              <p className="text-gray-400 mb-6">
                Adicione filmes, séries e canais aos seus Lions para acessá-los rapidamente
              </p>
              <Button 
                onClick={() => window.history.back()}
                className="bg-red-600 hover:bg-red-700"
              >
                Explorar Conteúdo
              </Button>
            </div>
          ) : (
            <>
              {/* Resultados da busca */}
              {searchTerm && (
                <div className="mb-6">
                  <p className="text-gray-400">
                    {filteredFavorites.length} item{filteredFavorites.length !== 1 ? 's' : ''} encontrado{filteredFavorites.length !== 1 ? 's' : ''} para "{searchTerm}"
                  </p>
                </div>
              )}

              {/* Carrosseis por categoria (quando não está buscando) */}
              {!searchTerm && (
                <div className="space-y-8">
                  {favoriteMovies.length > 0 && (
                    <ContentCarousel 
                      title="Filmes Salvos" 
                      items={favoriteMovies}
                      onAddToFavorites={handleRemoveFromFavorites}
                      isFavorite={isFavorite}
                    />
                  )}
                  
                  {favoriteSeries.length > 0 && (
                    <ContentCarousel 
                      title="Séries Salvas" 
                      items={favoriteSeries}
                      onAddToFavorites={handleRemoveFromFavorites}
                      isFavorite={isFavorite}
                    />
                  )}
                  
                  {favoriteLive.length > 0 && (
                    <ContentCarousel 
                      title="Canais Salvos" 
                      items={favoriteLive}
                      onAddToFavorites={handleRemoveFromFavorites}
                      isFavorite={isFavorite}
                    />
                  )}
                </div>
              )}

              {/* Grid de resultados da busca */}
              {searchTerm && (
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
                    : 'grid-cols-1'
                }`}>
                  {filteredFavorites.map((item) => (
                    <Card key={item.id} className="bg-gray-900 border-gray-800 group">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className={`${
                              viewMode === 'grid' 
                                ? 'w-full h-[300px] object-cover' 
                                : 'w-20 h-28 object-cover'
                            }`}
                          />
                          
                          {/* Overlay de ações */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex space-x-2">
                              <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                                <Play className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-white text-white hover:bg-white hover:text-black"
                                onClick={() => handleRemoveFromFavorites(item.id)}
                              >
                                <Heart className="h-3 w-3 fill-current" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <h3 className="font-medium truncate mb-1">{item.title}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              {item.year && <span>{item.year}</span>}
                              {item.rating && (
                                <span className="border border-gray-600 px-1 py-0.5">
                                  {item.rating}
                                </span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {item.type === 'movie' ? 'Filme' : item.type === 'series' ? 'Série' : 'Ao Vivo'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyLions;