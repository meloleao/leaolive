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
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          m3u_lists!inner(user_id)
        `)
        .eq('m3u_lists.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
    return content.filter(item => item.type === type);
  };

  const getFavoritesContent = () => {
    return content.filter(item => favorites.includes(item.id));
  };

  const isFavorite = (contentId: string) => {
    return favorites.includes(contentId);
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
    isFavorite
  };
};