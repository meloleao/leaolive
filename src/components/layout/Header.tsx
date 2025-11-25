import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaoLiveLogo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, User, Settings, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/auth/AuthProvider';
import { showSuccess } from '@/utils/toast';

interface HeaderProps {
  onMenuToggle?: () => void;
  onSearchClick?: () => void;
}

export const Header = ({ onMenuToggle, onSearchClick }: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    showSuccess('Logout realizado com sucesso!');
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent">
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center space-x-4 md:space-x-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="text-white hover:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <LeaoLiveLogo />
        </div>

        <div className="flex items-center space-x-4">
          {!isMobile && (
            <nav className="hidden lg:flex items-center space-x-6">
              <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Ao Vivo</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">Filmes</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">Séries</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">EPG</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors font-semibold">Meus Lions</a>
              <a href="/m3u-management" className="text-white hover:text-gray-300 transition-colors">Gerenciar Listas</a>
            </nav>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                onSearchClick?.();
              }}
              className="text-white hover:bg-white/10"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-white hover:bg-white/10"
              >
                <User className="h-5 w-5" />
              </Button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-md shadow-lg">
                  <div className="p-3 border-b border-gray-800">
                    <p className="text-sm text-white font-medium">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10"
                      onClick={() => navigate('/m3u-management')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm p-4">
          <div className="max-w-2xl mx-auto">
            <Input
              placeholder="Buscar filmes, séries, canais..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};