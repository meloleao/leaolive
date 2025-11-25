import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  year?: number;
  rating?: string;
  duration?: string;
  type: 'movie' | 'series' | 'live';
  description?: string;
  genre?: string;
  stream_url?: string;
  m3u_list_id: string;
}

export const useContent = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContent = async () => {
    if (!user) return;

    try {
      console.log('Fetching content for user:', user.id);
      
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          m3u_lists!inner(user_id)
        `)
        .eq('m3u_lists.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content:', error);
        throw error;
      }
      
      console.log('Content fetched:', data?.length || 0, 'items');
      console.log('Content types:', data?.map(item => ({ id: item.id, title: item.title, type: item.type, genre: item.genre })));
      
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('content_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.content_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (contentId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      if (favorites.includes(contentId)) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId);
        
        setFavorites(prev => prev.filter(id => id !== contentId));
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            content_id: contentId
          });
        
        setFavorites(prev => [...prev, contentId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const getContentByType = (type: 'movie' | 'series' | 'live') => {
    const filtered = content.filter(item => item.type === type);
    console.log(`getContentByType(${type}):`, filtered.length, 'items');
    return filtered;
  };

  const getFavoritesContent = () => {
    return content.filter(item => favorites.includes(item.id));
  };

  const isFavorite = (contentId: string) => {
    return favorites.includes(contentId);
  };

  // Novas funções para obter conteúdo por categoria específica
  const getMoviesByGenre = (genre: string) => {
    return content.filter(item => 
      item.type === 'movie' && 
      item.genre?.toLowerCase().includes(genre.toLowerCase())
    );
  };

  const getSeriesByGenre = (genre: string) => {
    return content.filter(item => 
      item.type === 'series' && 
      item.genre?.toLowerCase().includes(genre.toLowerCase())
    );
  };

  const getLiveChannelsByCategory = (category: string) => {
    const filtered = content.filter(item => 
      item.type === 'live' && 
      item.genre?.toLowerCase().includes(category.toLowerCase())
    );
    console.log(`getLiveChannelsByCategory(${category}):`, filtered.length, 'items');
    return filtered;
  };

  // Funções para obter conteúdo destacado
  const getFeaturedContent = () => {
    return content.slice(0, 10); // Primeiros 10 itens como destacados
  };

  const getContinueWatching = () => {
    // Simulação - em produção, buscar do histórico do usuário
    return content.slice(0, 6);
  };

  const getTrendingContent = () => {
    // Simulação - em produção, baseado em visualizações recentes
    return content.slice(0, 12);
  };

  // Função para buscar conteúdo
  const searchContent = (query: string) => {
    if (!query) return content;
    
    const lowercaseQuery = query.toLowerCase();
    return content.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.genre?.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Função para obter conteúdo aleatório para banners
  const getRandomContent = (count: number = 3) => {
    const shuffled = [...content].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    if (user) {
      fetchContent();
      fetchFavorites();
    } else {
      setContent([]);
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  return {
    content,
    favorites,
    loading,
    fetchContent,
    toggleFavorite,
    getContentByType,
    getFavoritesContent,
    isFavorite,
    // Novas funções
    getMoviesByGenre,
    getSeriesByGenre,
    getLiveChannelsByCategory,
    getFeaturedContent,
    getContinueWatching,
    getTrendingContent,
    searchContent,
    getRandomContent
  };
};