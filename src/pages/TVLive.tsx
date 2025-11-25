import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Volume2, VolumeX, Maximize2, Settings, Tv } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContent } from '@/hooks/useContent';
import { useM3ULists } from '@/hooks/useM3ULists';

const TVLive = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const { content, toggleFavorite, isFavorite } = useContent();
  const { lists } = useM3ULists();

  const liveChannels = content.filter(item => item.type === 'live');

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChannelSelect = (channel: any) => {
    setSelectedChannel(channel);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAddToFavorites = async (contentId: string) => {
    try {
      await toggleFavorite(contentId);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
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
          <h1 className="text-3xl font-bold mb-8">TV Ao Vivo</h1>
          
          {lists.length === 0 ? (
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
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Player */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-0">
                    {selectedChannel ? (
                      <div className="relative aspect-video bg-black">
                        {/* Player de vídeo real */}
                        <video
                          className="w-full h-full"
                          controls
                          autoPlay
                          muted={isMuted}
                          src={selectedChannel.stream_url}
                        >
                          <source src={selectedChannel.stream_url} type="application/x-mpegURL" />
                          <source src={selectedChannel.stream_url} type="video/mp4" />
                          Seu navegador não suporta este formato de vídeo.
                        </video>
                        
                        {/* Controles personalizados */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                className="text-white hover:bg-white/20"
                              >
                                {isMuted ? (
                                  <VolumeX className="h-5 w-5" />
                                ) : (
                                  <Volume2 className="h-5 w-5" />
                                )}
                              </Button>
                              <span className="text-white">{selectedChannel.title}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20"
                              >
                                <Settings className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFullscreen}
                                className="text-white hover:bg-white/20"
                              >
                                <Maximize2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play className="h-12 w-12 text-gray-400" />
                          </div>
                          <p className="text-gray-400">Selecione um canal para assistir</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
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
                    <h3 className="text-lg font-semibold mb-4">Canais Disponíveis</h3>
                    
                    {liveChannels.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Nenhum canal ao vivo encontrado</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Verifique se sua lista M3U foi atualizada
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {liveChannels.map((channel) => (
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
                                <h4 className="font-medium text-sm">{channel.title}</h4>
                                <p className="text-xs text-gray-400">
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
          )}
        </div>
      </main>
    </div>
  );
};

export default TVLive;