import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContent } from '@/hooks/useContent';
import { showSuccess, showError } from '@/utils/toast';

const Movies = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const isMobile = useIsMobile();
  const { content, toggleFavorite, isFavorite } = useContent();

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

  // Agrupar filmes por categoria
  const actionMovies = filteredMovies.filter(movie => movie.genre?.includes('Ação'));
  const comedyMovies = filteredMovies.filter(movie => movie.genre?.includes('Comédia'));
  const dramaMovies = filteredMovies.filter(movie => movie.genre?.includes('Drama'));
  const horrorMovies = filteredMovies.filter(movie => movie.genre?.includes('Terror'));
  const romanceMovies = filteredMovies.filter(movie => movie.genre?.includes('Romance'));

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
              <ContentCarousel 
                title="Ação" 
                items={actionMovies}
                onAddToFavorites={handleAddToFavorites}
                isFavorite={isFavorite}
              />
              
              <ContentCarousel 
                title="Comédia" 
                items={comedyMovies}
                onAddToFavorites={handleAddToFavorites}
                isFavorite={isFavorite}
              />
              
              <ContentCarousel 
                title="Drama" 
                items={dramaMovies}
                onAddToFavorites={handleAddToFavorites}
                isFavorite={isFavorite}
              />
              
              <ContentCarousel 
                title="Terror" 
                items={horrorMovies}
                onAddToFavorites={handleAddToFavorites}
                isFavorite={isFavorite}
              />
              
              <ContentCarousel 
                title="Romance" 
                items={romanceMovies}
                onAddToFavorites={handleAddToFavorites}
                isFavorite={isFavorite}
              />
            </div>
          ) : (
            /* Grid de resultados filtrados */
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
                : 'grid-cols-1'
            }`}>
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className={`${
                    viewMode === 'grid' 
                      ? 'group cursor-pointer' 
                      : 'flex items-center space-x-4 p-4 bg-gray-900 rounded-lg'
                  }`}
                >
                  <div className={viewMode === 'grid' ? 'relative overflow-hidden rounded-md' : 'flex-shrink-0'}>
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      className={`${
                        viewMode === 'grid' 
                          ? 'w-full h-[300px] object-cover' 
                          : 'w-20 h-28 object-cover rounded'
                      }`}
                    />
                  </div>
                  
                  <div className={viewMode === 'grid' ? 'mt-2' : 'flex-1'}>
                    <h3 className="text-white font-medium truncate">
                      {movie.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      {movie.year && <span>{movie.year}</span>}
                      {movie.rating && (
                        <>
                          <span>•</span>
                          <span className="border border-gray-600 px-1 py-0.5">
                            {movie.rating}
                          </span>
                        </>
                      )}
                      {movie.duration && (
                        <>
                          <span>•</span>
                          <span>{movie.duration}</span>
                        </>
                      )}
                    </div>
                    {movie.genre && viewMode === 'list' && (
                      <Badge variant="outline" className="mt-2 border-gray-600 text-gray-400">
                        {movie.genre}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredMovies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhum filme encontrado</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Movies;