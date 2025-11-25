import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useM3UProcessor } from './useM3UProcessor';

interface M3UList {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  last_updated: string;
  channel_count: number;
  movie_count: number;
  series_count: number;
  created_at: string;
  updated_at: string;
}

export const useM3ULists = () => {
  const [lists, setLists] = useState<M3UList[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { parseM3U, categorizeItems } = useM3UProcessor();

  const fetchLists = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('m3u_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching M3U lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const addList = async (name: string, url: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('m3u_lists')
        .insert({
          user_id: user.id,
          name,
          url,
          status: 'inactive'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchLists();
      return data;
    } catch (error) {
      console.error('Error adding M3U list:', error);
      throw error;
    }
  };

  const updateList = async (id: string, updates: Partial<M3UList>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('m3u_lists')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchLists();
      return data;
    } catch (error) {
      console.error('Error updating M3U list:', error);
      throw error;
    }
  };

  const deleteList = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('m3u_lists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchLists();
    } catch (error) {
      console.error('Error deleting M3U list:', error);
      throw error;
    }
  };

  const toggleListStatus = async (id: string) => {
    const list = lists.find(l => l.id === id);
    if (!list) return;

    const newStatus = list.status === 'active' ? 'inactive' : 'active';
    await updateList(id, { status: newStatus });
  };

  const refreshList = async (id: string) => {
    const list = lists.find(l => l.id === id);
    if (!list) throw new Error('List not found');

    try {
      // Atualizar status para processando
      await updateList(id, { status: 'inactive' });

      console.log(`Processing M3U list ${id} from URL: ${list.url}`);

      // Processar M3U no frontend
      const items = await parseM3U(list.url);
      const categorized = categorizeItems(items);

      console.log('M3U processed successfully:', categorized);

      // Limpar conteúdo antigo desta lista
      await supabase
        .from('content')
        .delete()
        .eq('m3u_list_id', id);

      // Inserir novo conteúdo
      const contentToInsert = items.map((item, index) => ({
        m3u_list_id: id,
        title: item.name,
        thumbnail: item.logo || '/api/placeholder/200/300',
        year: new Date().getFullYear(),
        rating: 'L',
        duration: 'Varia',
        type: item.type,
        description: `${item.type === 'live' ? 'Canal ao vivo' : item.type === 'movie' ? 'Filme' : 'Série'} - ${item.group || 'Sem categoria'}`,
        genre: item.group || 'Geral',
        stream_url: item.url
      }));

      if (contentToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('content')
          .insert(contentToInsert);

        if (insertError) {
          console.error('Error inserting content:', insertError);
          throw insertError;
        }
      }

      // Atualizar lista com as contagens
      await updateList(id, {
        status: 'active',
        channel_count: categorized.live.length,
        movie_count: categorized.movies.length,
        series_count: categorized.series.length,
        last_updated: new Date().toISOString()
      });

      return {
        success: true,
        itemCount: categorized.total,
        channelCount: categorized.live.length,
        movieCount: categorized.movies.length,
        seriesCount: categorized.series.length
      };

    } catch (error) {
      console.error('Error processing M3U list:', error);
      
      // Atualizar status para erro
      await updateList(id, { status: 'error' });
      
      // Propagar erro com mensagem clara
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Não foi possível acessar a URL da lista M3U. Verifique se a URL está correta e acessível.');
        } else if (error.message.includes('Invalid M3U format')) {
          throw new Error('O arquivo M3U não está em um formato válido.');
        } else if (error.message.includes('HTTP 404')) {
          throw new Error('URL não encontrada (404). Verifique se a URL está correta.');
        } else if (error.message.includes('HTTP 403')) {
          throw new Error('Acesso negado (403). Verifique se a URL requer autenticação.');
        } else if (error.message.includes('HTTP 5')) {
          throw new Error('Erro no servidor da URL. Tente novamente mais tarde.');
        } else {
          throw new Error(`Erro ao processar M3U: ${error.message}`);
        }
      } else {
        throw new Error('Erro desconhecido ao processar a lista M3U.');
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchLists();
    } else {
      setLists([]);
      setLoading(false);
    }
  }, [user]);

  return {
    lists,
    loading,
    fetchLists,
    addList,
    updateList,
    deleteList,
    toggleListStatus,
    refreshList
  };
};