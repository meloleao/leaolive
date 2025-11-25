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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: 'Início', href: '#' },
    { icon: Tv, label: 'TV Ao Vivo', href: '#' },
    { icon: Film, label: 'Filmes', href: '#' },
    { icon: Tv2, label: 'Séries', href: '#' },
    { icon: Calendar, label: 'EPG - Guia de Programação', href: '#' },
    { icon: Heart, label: 'Meus Lions', href: '#', highlight: true },
    { icon: List, label: 'Gerenciar Listas M3U', href: '#' },
    { icon: Settings, label: 'Configurações', href: '#' },
  ];

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
                  onClick={onClose}
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