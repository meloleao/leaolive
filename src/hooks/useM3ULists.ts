import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

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

      console.log(`Refreshing list ${id} from URL: ${list.url}`);

      // Chamar edge function para processar M3U
      const { data, error } = await supabase.functions.invoke('process-m3u', {
        body: { 
          listId: id, 
          url: list.url 
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error details:', error);
        throw new Error(`Edge Function error: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No response from Edge Function');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Function success:', data);
      
      // Atualizar a lista local com os novos dados
      await fetchLists();
      
      return data;
    } catch (error) {
      console.error('Error refreshing M3U list:', error);
      
      // Atualizar status para erro
      await updateList(id, { status: 'error' });
      
      // Propagar erro com mensagem mais clara
      if (error.message.includes('Edge Function')) {
        throw new Error('Erro na função de processamento. Verifique o console para detalhes.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Não foi possível acessar a URL da lista M3U. Verifique se a URL está correta e acessível.');
      } else if (error.message.includes('Invalid M3U format')) {
        throw new Error('O arquivo M3U não está em um formato válido.');
      } else if (error.message.includes('No valid items')) {
        throw new Error('Nenhum item válido encontrado no arquivo M3U.');
      } else {
        throw error;
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