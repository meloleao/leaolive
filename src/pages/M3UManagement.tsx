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

interface M3UList {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdated: string;
  channelCount: number;
  movieCount: number;
  seriesCount: number;
}

const mockM3ULists: M3UList[] = [
  {
    id: '1',
    name: 'Lista Premium Brasil',
    url: 'https://example.com/lista1.m3u',
    status: 'active',
    lastUpdated: '2024-01-15 14:30',
    channelCount: 250,
    movieCount: 1200,
    seriesCount: 180
  },
  {
    id: '2',
    name: 'Canais Internacionais',
    url: 'https://example.com/lista2.m3u',
    status: 'active',
    lastUpdated: '2024-01-15 12:15',
    channelCount: 180,
    movieCount: 800,
    seriesCount: 120
  },
  {
    id: '3',
    name: 'Filmes e Séries HD',
    url: 'https://example.com/lista3.m3u',
    status: 'error',
    lastUpdated: '2024-01-14 09:45',
    channelCount: 0,
    movieCount: 0,
    seriesCount: 0
  },
  {
    id: '4',
    name: 'Esportes Ao Vivo',
    url: 'https://example.com/lista4.m3u',
    status: 'inactive',
    lastUpdated: '2024-01-13 18:20',
    channelCount: 45,
    movieCount: 0,
    seriesCount: 0
  }
];

const M3UManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lists, setLists] = useState<M3UList[]>(mockM3ULists);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListUrl, setNewListUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getStatusIcon = (status: M3UList['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <PowerOff className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: M3UList['status']) => {
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
      <Badge variant="outline" className={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
      </Badge>
    );
  };

  const handleAddList = () => {
    if (!newListName || !newListUrl) {
      showError('Por favor, preencha todos os campos');
      return;
    }

    const newList: M3UList = {
      id: Date.now().toString(),
      name: newListName,
      url: newListUrl,
      status: 'inactive',
      lastUpdated: new Date().toLocaleString('pt-BR'),
      channelCount: 0,
      movieCount: 0,
      seriesCount: 0
    };

    setLists([...lists, newList]);
    setNewListName('');
    setNewListUrl('');
    setIsAddDialogOpen(false);
    showSuccess('Lista M3U adicionada com sucesso!');
  };

  const handleToggleStatus = (id: string) => {
    setLists(lists.map(list => 
      list.id === id 
        ? { 
            ...list, 
            status: list.status === 'active' ? 'inactive' : 'active',
            lastUpdated: new Date().toLocaleString('pt-BR')
          }
        : list
    ));
    showSuccess('Status da lista atualizado!');
  };

  const handleRefresh = async (id: string) => {
    setIsRefreshing(id);
    // Simulação de atualização
    setTimeout(() => {
      setLists(lists.map(list => 
        list.id === id 
          ? { 
              ...list, 
              lastUpdated: new Date().toLocaleString('pt-BR'),
              status: 'active',
              channelCount: Math.floor(Math.random() * 300) + 50,
              movieCount: Math.floor(Math.random() * 1500) + 500,
              seriesCount: Math.floor(Math.random() * 200) + 50
            }
          : list
      ));
      setIsRefreshing(null);
      showSuccess('Lista atualizada com sucesso!');
    }, 2000);
  };

  const handleDelete = (id: string) => {
    setLists(lists.filter(list => list.id !== id));
    showSuccess('Lista removida com sucesso!');
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
                          Última atualização: {list.lastUpdated}
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
                        <div className="text-2xl font-bold text-blue-400">{list.channelCount}</div>
                        <div className="text-sm text-gray-400">Canais</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{list.movieCount}</div>
                        <div className="text-sm text-gray-400">Filmes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{list.seriesCount}</div>
                        <div className="text-sm text-gray-400">Séries</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default M3UManagement;