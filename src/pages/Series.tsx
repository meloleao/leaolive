import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Grid, List, Play, Heart, Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContent } from '@/hooks/useContent';
import { useM3ULists } from '@/hooks/useM3ULists';
import IPTVPlayer from '@/components/media/IPTVPlayer';
import { showSuccess, showError } from '@/utils/toast';

const Series = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSerie, setSelectedSerie] = useState<any>(null);
  const isMobile = useIsMobile();
  const { content, toggleFavorite, isFavorite } = useContent();
  const { lists } = useM3ULists();

  const series = content.filter(item => item.type === 'series');
  
  // Filtrar séries
  const filteredSeries = series.filter(serie => {
    const matchesSearch = serie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || serie.genre === selectedGenre;
    const matchesYear = selectedYear === 'all' || serie.year?.toString() === selectedYear;
    return matchesSearch && matchesGenre && matchesYear;
  });

  // Obter gêneros únicos
  const genres = [...new Set(series.map(serie => serie.genre).filter(Boolean))];
  
  // Obter anos únicos
  const years = [...new Set(series.map(serie => serie.year).filter(Boolean))].sort((a, b) => b - a);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddToFavorites = async (contentId: string) => {
    try {
      await toggleFavorite(contentId);
      const action = isFavorite(contentId) ? 'removida dos' : 'adicionada aos';
      showSuccess(`Série ${action} Lions com sucesso!`);
    } catch (error) {
      showError('Erro ao gerenciar favoritos');
    }
  };

  const handleSerieSelect = (serie: any) => {
    setSelectedSerie(serie);
  };

  const handleStreamError = (error: string) => {
    showError(`Erro no stream: ${error}`);
  };

  const handleStreamEnd = () => {
    // Lógica para quando o episódio termina
    console.log('Episode ended');
  };

  // Agrupar séries por categoria
  const dramaSeries = filteredSeries.filter(serie => serie.genre?.toLowerCase().includes('drama'));
  const comedySeries = filteredSeries.filter(serie => serie.genre?.toLowerCase().includes('comédia') || serie.genre?.toLowerCase().includes('comedy'));
  const scifiSeries = filteredSeries.filter(serie => serie.genre?.toLowerCase().includes('ficção') || serie.genre?.toLowerCase().includes('sci-fi'));
  const thrillerSeries = filteredSeries.filter(serie => serie.genre?.toLowerCase().includes('suspense') || serie.genre?.toLowerCase().includes('thriller'));
  const documentarySeries = filteredSeries.filter(serie => serie.genre?.toLowerCase().includes('documentário') || serie.genre?.toLowerCase().includes('documentary'));

  if (lists.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header onMenuToggle={handleMenuToggle} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className={`pt-20 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">Nenhuma lista M3U configurada</h2>
              <p className="text-gray-400 mb-6">
                Adicione uma lista M3U para acessar séries
              </p>
              <Button 
                onClick={() => window.location.href = '/m3u-management'}
                className="bg-red-600 hover:bg-red-700"
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
      <Header onMenuToggle={handleMenuToggle} />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className={`pt-20 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
        <div className="container mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">Séries</h1>
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar séries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Gêneros</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Anos</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
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

          {/* Resultados da busca */}
          {searchTerm && (
            <div className="mb-6">
              <p className="text-gray-400">
                {filteredSeries.length} série{filteredSeries.length !== 1 ? 's' : ''} encontrada{filteredSeries.length !== 1 ? 's' : ''} para "{searchTerm}"
              </p>
            </div>
          )}

          {/* Carrosseis por categoria */}
          {!searchTerm && selectedGenre === 'all' && selectedYear === 'all' ? (
            <div className="space-y-8">
              {dramaSeries.length > 0 && (
                <ContentCarousel 
                  title="Séries Dramáticas" 
                  items={dramaSeries}
                  onAddToFavorites={handleAddToFavorites}
                  isFavorite={isFavorite}
                />
              )}
              
              {comedySeries.length > 0 && (
                <ContentCarousel 
                  title="Séries de Comédia" 
                  items={comedySeries}
                  onAddToFavorites={handleAddToFavorites}
                  isFavorite={isFavorite}
                />
              )}
              
              {scifiSeries.length > 0 && (
                <ContentCarousel 
                  title="Ficção Científica" 
                  items={scifiSeries}
                  onAddToFavorites={handleAddToFavorites}
                  isFavorite={isFavorite}
                />
              )}
              
              {thrillerSeries.length > 0 && (
                <ContentCarousel 
                  title="Suspense e Thriller" 
                  items={thrillerSeries}
                  onAddToFavorites={handleAddToFavorites}
                  isFavorite={isFavorite}
                />
              )}
              
              {documentarySeries.length > 0 && (
                <ContentCarousel 
                  title="Documentários" 
                  items={documentarySeries}
                  onAddToFavorites={handleAddToFavorites}
                  isFavorite={isFavorite}
                />
              )}
            </div>
          ) : (
            /* Grid de resultados filtrados */
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
                : 'grid-cols-1'
            }`}>
              {filteredSeries.map((serie) => (
                <Card 
                  key={serie.id} 
                  className="bg-gray-900 border-gray-800 cursor-pointer hover:border-gray-600 transition-colors"
                  onClick={() => handleSerieSelect(serie)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={serie.thumbnail}
                        alt={serie.title}
                        className={`${
                          viewMode === 'grid' 
                            ? 'w-full h-[300px] object-cover' 
                            : 'w-20 h-28 object-cover'
                        }`}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="text-white font-medium truncate mb-1">
                        {serie.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          {serie.year && <span>{serie.year}</span>}
                          {serie.rating && (
                            <span className="border border-gray-600 px-1 py-0.5">
                              {serie.rating}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(serie.id);
                          }}
                          className={`${
                            isFavorite(serie.id)
                              ? 'text-red-500' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(serie.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredSeries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhuma série encontrada</p>
            </div>
          )}

          {/* Modal de detalhes da série */}
          {selectedSerie && (
            <div 
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedSerie(null)}
            >
              <div 
                className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <IPTVPlayer
                      streamUrl={selectedSerie.stream_url}
                      title={selectedSerie.title}
                      type="series"
                      poster={selectedSerie.thumbnail}
                      onStreamEnd={handleStreamEnd}
                      onError={handleStreamError}
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{selectedSerie.title}</h2>
                    <div className="flex items-center space-x-4 mb-4">
                      {selectedSerie.year && <span>{selectedSerie.year}</span>}
                      {selectedSerie.rating && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          {selectedSerie.rating}
                        </Badge>
                      )}
                      {selectedSerie.duration && <span>{selectedSerie.duration}</span>}
                    </div>
                    <p className="text-gray-300 mb-6">{selectedSerie.description}</p>
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => handleAddToFavorites(selectedSerie.id)}
                        className={`${
                          isFavorite(selectedSerie.id)
                            ? 'bg-red-600 text-white border-red-600' 
                            : 'border-white text-white hover:bg-white hover:text-black'
                        }`}
                      >
                        <Heart className={`mr-2 h-4 w-4 ${isFavorite(selectedSerie.id) ? 'fill-current' : ''}`} />
                        {isFavorite(selectedSerie.id) ? 'Nos Lions' : 'Adicionar aos Lions'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Series;