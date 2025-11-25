import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FeaturedBanner } from '@/components/content/FeaturedBanner';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { useIsMobile } from '@/hooks/use-mobile';

// Dados mockados para demonstração
const mockContent = {
  continueWatching: [
    { id: '1', title: 'Stranger Things', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '16', duration: '50min', type: 'series' as const },
    { id: '2', title: 'The Crown', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '14', duration: '1h', type: 'series' as const },
    { id: '3', title: 'Avatar 2', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '12', duration: '3h 12min', type: 'movie' as const },
  ],
  myLions: [
    { id: '4', title: 'Breaking Bad', thumbnail: '/api/placeholder/200/300', year: 2013, rating: '18', duration: '47min', type: 'series' as const },
    { id: '5', title: 'Inception', thumbnail: '/api/placeholder/200/300', year: 2010, rating: '14', duration: '2h 28min', type: 'movie' as const },
    { id: '6', title: 'The Office', thumbnail: '/api/placeholder/200/300', year: 2013, rating: '12', duration: '22min', type: 'series' as const },
  ],
  trending: [
    { id: '7', title: 'Wednesday', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '14', duration: '45min', type: 'series' as const },
    { id: '8', title: 'Top Gun Maverick', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '12', duration: '2h 10min', type: 'movie' as const },
    { id: '9', title: 'House of Dragon', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '16', duration: '1h', type: 'series' as const },
  ],
  movies: [
    { id: '10', title: 'Dune', thumbnail: '/api/placeholder/200/300', year: 2021, rating: '14', duration: '2h 35min', type: 'movie' as const },
    { id: '11', title: 'The Batman', thumbnail: '/api/placeholder/200/300', year: 2022, rating: '16', duration: '2h 56min', type: 'movie' as const },
    { id: '12', title: 'Spider-Man', thumbnail: '/api/placeholder/200/300', year: 2021, rating: '12', duration: '2h 28min', type: 'movie' as const },
  ],
  series: [
    { id: '13', title: 'The Last of Us', thumbnail: '/api/placeholder/200/300', year: 2023, rating: '18', duration: '55min', type: 'series' as const },
    { id: '14', title: 'The Mandalorian', thumbnail: '/api/placeholder/200/300', year: 2023, rating: '12', duration: '40min', type: 'series' as const },
    { id: '15', title: 'Succession', thumbnail: '/api/placeholder/200/300', year: 2023, rating: '16', duration: '1h', type: 'series' as const },
  ],
  live: [
    { id: '16', title: 'Globo News', thumbnail: '/api/placeholder/200/300', type: 'live' as const },
    { id: '17', title: 'ESPN Brasil', thumbnail: '/api/placeholder/200/300', type: 'live' as const },
    { id: '18', title: 'Band Sports', thumbnail: '/api/placeholder/200/300', type: 'live' as const },
  ]
};

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchClick = () => {
    // Implementar lógica de busca
    console.log('Abrir busca');
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
          <ContentCarousel 
            title="Continuar Assistindo" 
            items={mockContent.continueWatching}
            showAddButton={false}
          />
          
          <ContentCarousel 
            title="Meus Lions" 
            items={mockContent.myLions}
          />
          
          <ContentCarousel 
            title="Em Alta na TV" 
            items={mockContent.trending}
          />
          
          <ContentCarousel 
            title="Filmes Populares" 
            items={mockContent.movies}
          />
          
          <ContentCarousel 
            title="Séries Dramáticas" 
            items={mockContent.series}
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