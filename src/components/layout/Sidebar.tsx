import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Tv, 
  Film, 
  Tv2, 
  Calendar, 
  Heart, 
  List, 
  Settings, 
  X,
  Home,
  PlayCircle
} from 'lucide-react';
import { LeaoLiveLogo } from '@/components/ui/logo';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Início', href: '/home' },
    { icon: Tv, label: 'TV Ao Vivo', href: '/tv-live' },
    { icon: Film, label: 'Filmes', href: '/movies' },
    { icon: Tv2, label: 'Séries', href: '/series' },
    { icon: Calendar, label: 'EPG - Guia de Programação', href: '/epg' },
    { icon: Heart, label: 'Meus Lions', href: '/my-lions', highlight: true },
    { icon: List, label: 'Gerenciar Listas M3U', href: '/m3u-management' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
      `}>
        <div className="flex items-center justify-between p-6">
          <LeaoLiveLogo />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Separator className="bg-gray-800" />
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Button
                  variant="ghost"
                  className={`
                    w-full justify-start text-white hover:bg-white/10
                    ${item.highlight ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10' : ''}
                  `}
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Separator className="bg-gray-800 mb-4" />
          <div className="text-center text-gray-500 text-xs">
            <p>Leão Live v1.0</p>
            <p>© 2024 Todos os direitos reservados</p>
          </div>
        </div>
      </aside>
    </>
  );
};