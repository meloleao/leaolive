import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContent } from '@/hooks/useContent';
import { useM3ULists } from '@/hooks/useM3ULists';
import IPTVPlayer from '@/components/media/IPTVPlayer';
import { showSuccess, showError } from '@/utils/toast';

const TVLive = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const isMobile = useIsMobile();
  const { 
    content, 
    toggleFavorite, 
    isFavorite,
    getContentByType,
    getLiveChannelsByCategory
  } = useContent();
  const { lists } = useM3ULists();

  const liveChannels = getContentByType('live');
  
  // Obter categorias únicas dos canais
  const categories = [...new Set(liveChannels.map(channel => channel.genre).filter(Boolean))];

  // Filtrar canais por categoria
  const getFilteredChannels = () => {
    if (selectedCategory === 'all') {
      return liveChannels;
    }
    return getLiveChannelsByCategory(selectedCategory);
  };

  const filteredChannels = getFilteredChannels();

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChannelSelect = (channel: any) => {
    setSelectedChannel(channel);
    showSuccess(`Sintonizado: ${channel.title}`);
  };

  const handleAddToFavorites = async (contentId: string) => {
    try {
      await toggleFavorite(contentId);
      const action = isFavorite(contentId) ? 'removido dos' : 'adicionado aos';
      showSuccess(`Canal ${action} Lions com sucesso!`);
    } catch (error) {
      showError('Erro ao gerenciar favoritos');
    }
  };

  const handleStreamError = (error: string) => {
    showError(`Erro no stream: ${error}`);
  };

  const handleStreamEnd = () => {
    // Lógica para quando o stream termina (para canais ao vivo, geralmente não se aplica)
    console.log('Stream ended');
  };

  if (lists.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header onMenuToggle={handleMenuToggle} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className={`pt-20 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="text-center py-16">
              <Tv className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Nenhuma lista M3U configurada</h2>
              <p className="text-gray-400 mb-6">
                Adicione uma lista M3U para acessar canais ao vivo
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">TV Ao Vivo</h1>
            
            {/* Filtro de categorias */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Player */}
            <div className="lg:col-span-2">
              {selectedChannel ? (
                <IPTVPlayer
                  streamUrl={selectedChannel.stream_url}
                  title={selectedChannel.title}
                  type="live"
                  poster={selectedChannel.thumbnail}
                  autoPlay={true}
                  onStreamEnd={handleStreamEnd}
                  onError={handleStreamError}
                />
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Tv className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-gray-400">Selecione um canal para assistir</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Informações do canal */}
              {selectedChannel && (
                <Card className="bg-gray-900 border-gray-800 mt-4">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{selectedChannel.title}</h3>
                    <p className="text-gray-400 mb-4">
                      {selectedChannel.description || 'Canal ao vivo com programação 24 horas.'}
                    </p>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="border-red-500 text-red-400">
                        AO VIVO
                      </Badge>
                      {selectedChannel.genre && (
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          {selectedChannel.genre}
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToFavorites(selectedChannel.id)}
                        className={`${
                          isFavorite(selectedChannel.id)
                            ? 'bg-red-600 text-white border-red-600' 
                            : 'border-white text-white hover:bg-white hover:text-black'
                        }`}
                      >
                        {isFavorite(selectedChannel.id) ? 'Nos Lions' : 'Adicionar aos Lions'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Lista de canais */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {selectedCategory === 'all' ? 'Todos os Canais' : selectedCategory}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {filteredChannels.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Nenhum canal encontrado</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {selectedCategory !== 'all' 
                          ? `Nenhum canal na categoria "${selectedCategory}"` 
                          : 'Verifique se sua lista M3U foi atualizada'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredChannels.map((channel) => (
                        <div
                          key={channel.id}
                          onClick={() => handleChannelSelect(channel)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedChannel?.id === channel.id
                              ? 'bg-red-600/20 border border-red-600'
                              : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                              {channel.thumbnail && channel.thumbnail !== '/api/placeholder/200/300' ? (
                                <img 
                                  src={channel.thumbnail} 
                                  alt={channel.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Tv className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm truncate">{channel.title}</h4>
                              <p className="text-xs text-gray-400 truncate">
                                {channel.genre || 'Canal ao vivo'}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-red-500 text-red-400 text-xs">
                              AO VIVO
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TVLive;