import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Power, 
  PowerOff,
  CheckCircle,
  XCircle,
  Clock,
  Link
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useM3ULists } from '@/hooks/useM3ULists';

const M3UManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListUrl, setNewListUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const { lists, loading, addList, deleteList, toggleListStatus, refreshList } = useM3ULists();

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <PowerOff className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const labels = {
      active: 'Ativa',
      inactive: 'Desativada',
      error: 'Erro'
    };

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status as keyof typeof labels]}</span>
      </Badge>
    );
  };

  const handleAddList = async () => {
    if (!newListName || !newListUrl) {
      showError('Por favor, preencha todos os campos');
      return;
    }

    // Validar URL
    try {
      new URL(newListUrl);
    } catch {
      showError('Por favor, insira uma URL válida');
      return;
    }

    try {
      await addList(newListName, newListUrl);
      setNewListName('');
      setNewListUrl('');
      setIsAddDialogOpen(false);
      showSuccess('Lista M3U adicionada com sucesso!');
    } catch (error) {
      console.error('Add list error:', error);
      showError('Erro ao adicionar lista M3U');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleListStatus(id);
      showSuccess('Status da lista atualizado!');
    } catch (error) {
      console.error('Toggle status error:', error);
      showError('Erro ao atualizar status da lista');
    }
  };

  const handleRefresh = async (id: string) => {
    setIsRefreshing(id);
    try {
      console.log('Starting refresh for list:', id);
      const result = await refreshList(id);
      
      console.log('Refresh result:', result);
      
      if (result && result.success) {
        showSuccess(
          `Lista atualizada com sucesso! ` +
          `${result.channelCount || 0} canais, ` +
          `${result.movieCount || 0} filmes, ` +
          `${result.seriesCount || 0} séries`
        );
      } else {
        throw new Error('Falha ao processar a lista');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showError(`Erro ao atualizar lista: ${errorMessage}`);
    } finally {
      setIsRefreshing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await deleteList(id);
      showSuccess('Lista removida com sucesso!');
    } catch (error) {
      console.error('Delete error:', error);
      showError('Erro ao remover lista');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Carregando listas M3U...</p>
        </div>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gerenciar Listas M3U</h1>
              <p className="text-gray-400">
                Adicione, configure e gerencie suas listas de reprodução M3U
              </p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Nova Lista
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Lista M3U</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Insira os dados da sua lista M3U para adicionar ao Leão Live
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Lista</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Lista Premium Brasil"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL da Lista M3U</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com/lista.m3u"
                      value={newListUrl}
                      onChange={(e) => setNewListUrl(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <Button 
                    onClick={handleAddList}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Adicionar Lista
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {lists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">Nenhuma lista M3U encontrada</p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar sua primeira lista
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {lists.map((list) => (
                <Card key={list.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{list.name}</CardTitle>
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(list.status)}
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="h-4 w-4 mr-1" />
                            Última atualização: {formatDate(list.last_updated)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(list.id)}
                          className="text-white hover:bg-white/10"
                        >
                          {list.status === 'active' ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefresh(list.id)}
                          disabled={isRefreshing === list.id}
                          className="text-white hover:bg-white/10"
                        >
                          {isRefreshing === list.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(list.id)}
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <Link className="h-4 w-4 mr-2" />
                        <span className="truncate">{list.url}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-800">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{list.channel_count}</div>
                          <div className="text-sm text-gray-400">Canais</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{list.movie_count}</div>
                          <div className="text-sm text-gray-400">Filmes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{list.series_count}</div>
                          <div className="text-sm text-gray-400">Séries</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default M3UManagement;