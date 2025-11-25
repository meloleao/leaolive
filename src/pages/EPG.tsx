import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, Tv } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContent } from '@/hooks/useContent';
import { useM3ULists } from '@/hooks/useM3ULists';

interface Program {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  category: string;
}

interface Channel {
  id: string;
  name: string;
  number: number;
  logo: string;
  currentProgram?: Program;
  programs: Program[];
}

const EPG = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useIsMobile();
  const { content } = useContent();
  const { lists } = useM3ULists();

  const liveChannels = content.filter(item => item.type === 'live');

  // Criar dados mockados baseados nos canais reais
  const mockChannels: Channel[] = liveChannels.slice(0, 10).map((channel, index) => ({
    id: channel.id,
    name: channel.title,
    number: index + 1,
    logo: channel.thumbnail,
    currentProgram: {
      id: `prog-${index}`,
      title: `Programa Atual - ${channel.title}`,
      startTime: '20:00',
      endTime: '21:00',
      description: `Programação ao vivo de ${channel.title}`,
      category: channel.genre || 'Ao Vivo'
    },
    programs: [
      {
        id: `prog-${index}-1`,
        title: `Programa Atual - ${channel.title}`,
        startTime: '20:00',
        endTime: '21:00',
        description: `Programação ao vivo de ${channel.title}`,
        category: channel.genre || 'Ao Vivo'
      },
      {
        id: `prog-${index}-2`,
        title: `Próximo Programa - ${channel.title}`,
        startTime: '21:00',
        endTime: '22:00',
        description: `Continuação da programação de ${channel.title}`,
        category: channel.genre || 'Ao Vivo'
      }
    ]
  }));

  const channels = mockChannels;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(timer);
  }, []);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    }
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return ((hours * 60) + minutes) / (24 * 60) * 100;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Jornalismo': 'bg-blue-600',
      'Filme': 'bg-purple-600',
      'Novela': 'bg-pink-600',
      'Entretenimento': 'bg-green-600',
      'Reality Show': 'bg-orange-600',
      'Esportes': 'bg-red-600',
      'Ao Vivo': 'bg-red-600'
    };
    return colors[category] || 'bg-gray-600';
  };

  if (lists.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header onMenuToggle={handleMenuToggle} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className={`pt-20 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">Nenhuma lista M3U configurada</h2>
              <p className="text-gray-400 mb-6">
                Adicione uma lista M3U para acessar o guia de programação
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Guia de Programação</h1>
            
            {/* Controle de data */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeDate(-1)}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeDate(1)}
                className="text-white hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Grade de programação */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              {/* Cabeçalho com horários */}
              <div className="flex border-b border-gray-800">
                <div className="w-32 p-4 border-r border-gray-800">
                  <span className="text-sm font-medium">Canal</span>
                </div>
                <div className="flex-1 flex">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="flex-1 text-center text-xs text-gray-400 py-2 border-r border-gray-800">
                      {i.toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
              </div>

              {/* Linha do tempo atual */}
              {formatDate(selectedDate) === 'Hoje' && (
                <div className="relative">
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${getCurrentTimePosition()}%` }}
                  >
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              )}

              {/* Programação dos canais */}
              <div className="relative">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex border-b border-gray-800">
                    {/* Informações do canal */}
                    <div className="w-32 p-4 border-r border-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                          <Tv className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm truncate">{channel.name}</div>
                          <div className="text-xs text-gray-400">Ch {channel.number}</div>
                        </div>
                      </div>
                    </div>

                    {/* Programação do canal */}
                    <div className="flex-1 relative h-20">
                      {channel.programs.map((program) => {
                        const startHour = parseInt(program.startTime.split(':')[0]);
                        const startMinute = parseInt(program.startTime.split(':')[1]);
                        const endHour = parseInt(program.endTime.split(':')[0]);
                        const endMinute = parseInt(program.endTime.split(':')[1]);
                        
                        const startPosition = ((startHour * 60) + startMinute) / (24 * 60) * 100;
                        const duration = ((endHour * 60) + endMinute) - ((startHour * 60) + startMinute);
                        const width = (duration / (24 * 60)) * 100;

                        return (
                          <div
                            key={program.id}
                            className={`absolute top-2 bottom-2 ${getCategoryColor(program.category)} rounded p-2 cursor-pointer hover:opacity-80 transition-opacity`}
                            style={{
                              left: `${startPosition}%`,
                              width: `${width}%`
                            }}
                          >
                            <div className="text-xs font-medium truncate">{program.title}</div>
                            <div className="text-xs opacity-75">
                              {program.startTime} - {program.endTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de programas em destaque */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Programas em Destaque</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.flatMap(channel => channel.programs).slice(0, 6).map((program) => (
                <Card key={program.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{program.title}</h3>
                      <Badge variant="outline" className={getCategoryColor(program.category) + ' border-transparent'}>
                        {program.category}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {program.startTime} - {program.endTime}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{program.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EPG;