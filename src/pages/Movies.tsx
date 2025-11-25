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

const Movies = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const isMobile = useIsMobile();
  const { content, toggleFavorite, isFavorite } = useContent();
  const { lists } = useM3ULists();

  const movies = content.filter(item => item.type === 'movie');
  
  // Filtrar filmes
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || movie.genre === selectedGenre;
    const matchesYear = selectedYear === 'all' || movie.year?.toString() === selectedYear;
    return matchesSearch && matchesGenre && matchesYear;
  });

  // Obter gêneros únicos
  const genres = [...new Set(movies.map(movie => movie.genre).filter(Boolean))];
  
  // Obter anos únicos
  const years = [...new Set(movies.map(movie => movie.year).filter(Boolean))].sort((a, b) => b - a);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddToFavorites = async (contentId: string) => {
    try {
      await toggleFavorite(contentId);
      const action = isFavorite(contentId) ? 'removido dos' : 'adicionado aos';
      showSuccess(`Filme ${action} Lions com sucesso!`);
    } catch (error) {
      showError('Erro ao gerenciar favoritos');
    }
  };

  const handleMovieSelect = (movie: any) => {
    setSelectedMovie(movie);
  };

  const handleStreamError = (error: string) => {
    showError(`Erro no stream: ${error}`);
  };

  const handleStreamEnd = () => {
    // Lógica para quando o filme termina
    console.log('Movie ended');
  };

  // Agrupar filmes por categoria
  const actionMovies = filteredMovies.filter(movie => movie.genre?.toLowerCase().includes('ação') || movie.genre?.toLowerCase().includes('action'));
  const comedyMovies = filteredMovies.filter(movie => movie.genre?.toLowerCase().includes('comédia') || movie.genre?.toLowerCase().includes('comedy'));
  const dramaMovies = filteredMovies.filter(movie => movie.genre?.toLowerCase().includes('drama'));
  const horrorMovies = filteredMovies.filter(movie => movie.genre?.toLowerCase().includes('terror') || movie.genre?.toLowerCase().includes('horror'));
  const romanceMovies = filteredMovies.filter(movie => movie.genre?.toLowerCase().includes('romance'));

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
                Adicione uma lista M3U para acessar filmes
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
            <h1 className="text-3xl font-bold mb-4 md:mb-0">Filmes</h1>
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar filmes..."
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
                {filteredMovies.length} filme{filteredMovies.length !== 1 ? 's' : ''} encontrado{filteredMovies.length !== 1 ? 's' : ''} para "{searchTerm}"
              </p>
            </div>
          )}

          {/* Carrosseis por categoria */}
          {!searchTerm && selectedGenre === 'all' && selectedYear === 'all' ? (
            <div className="space-y-8">
              {actionMovies.length > 0 && (
                <ContentCarousel 
                  title="Ação" 
                  items={actionMovies}
                  onAddToFavorites={handleAddToFavorites}
                  isFavorite={isFavorite}
                />
              )}
              
              {comedyMovies.length > 0 && (
                <ContentCarousel 
                  title="Comédia" 
                  items={comedyMovies}
                  onAddToFavorites={handleAddToFavorites}
                  isFavorite={isFavorite}
                />
              )}
              
              {dramaMovies.length > 0 && (
                <ContentCarousel 
                  title="Drama" 
                  items={dramaMovies}
                  onAddToFavorites={handleAddToFavorites}
                  isFavorite={isFavorite}
                />
              )}
              
              {horrorMovies.length > 0 && (
                <ContentCarousel 
                  title="Terror" 
                  items={horrorMovies}
                  onAddToFavorites={handleAddToFavorites}
                  isFavorite={isFavorite}
                />
              )}
              
              {romanceMovies.length > 0 && (
                <ContentCarousel 
                  title="Romance" 
                  items={romanceMovies}
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
              {filteredMovies.map((movie) => (
                <Card 
                  key={movie.id} 
                  className="bg-gray-900 border-gray-800 cursor-pointer hover:border-gray-600 transition-colors"
                  onClick={() => handleMovieSelect(movie)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={movie.thumbnail}
                        alt={movie.title}
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
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          {movie.year && <span>{movie.year}</span>}
                          {movie.rating && (
                            <span className="border border-gray-600 px-1 py-0.5">
                              {movie.rating}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(movie.id);
                          }}
                          className={`${
                            isFavorite(movie.id)
                              ? 'text-red-500' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(movie.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredMovies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhum filme encontrado</p>
            </div>
          )}

          {/* Modal de detalhes do filme */}
          {selectedMovie && (
            <div 
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedMovie(null)}
            >
              <div 
                className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <IPTVPlayer
                      streamUrl={selectedMovie.stream_url}
                      title={selectedMovie.title}
                      type="movie"
                      poster={selectedMovie.thumbnail}
                      onStreamEnd={handleStreamEnd}
                      onError={handleStreamError}
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{selectedMovie.title}</h2>
                    <div className="flex items-center space-x-4 mb-4">
                      {selectedMovie.year && <span>{selectedMovie.year}</span>}
                      {selectedMovie.rating && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          {selectedMovie.rating}
                        </Badge>
                      )}
                      {selectedMovie.duration && <span>{selectedMovie.duration}</span>}
                    </div>
                    <p className="text-gray-300 mb-6">{selectedMovie.description}</p>
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => handleAddToFavorites(selectedMovie.id)}
                        className={`${
                          isFavorite(selectedMovie.id)
                            ? 'bg-red-600 text-white border-red-600' 
                            : 'border-white text-white hover:bg-white hover:text-black'
                        }`}
                      >
                        <Heart className={`mr-2 h-4 w-4 ${isFavorite(selectedMovie.id) ? 'fill-current' : ''}`} />
                        {isFavorite(selectedMovie.id) ? 'Nos Lions' : 'Adicionar aos Lions'}
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

export default Movies;