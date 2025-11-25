import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  HelpCircle, 
  LogOut,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/auth/AuthProvider';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário
  const [profileData, setProfileData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    language: 'pt-BR',
    theme: 'dark',
    notifications: true,
    emailNotifications: true,
    autoplay: true,
    quality: 'auto'
  });

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulação de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      showError('Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      // Simulação de alteração de senha
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showError('Erro ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Simulação de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Preferências salvas com sucesso!');
    } catch (error) {
      showError('Erro ao salvar preferências');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showSuccess('Logout realizado com sucesso!');
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'preferences', label: 'Preferências', icon: Palette },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'help', label: 'Ajuda', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onMenuToggle={handleMenuToggle} />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className={`pt-20 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
        <div className="container mx-auto px-4 md:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Configurações</h1>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Menu lateral */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                            activeTab === tab.id
                              ? 'bg-red-600 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                  
                  <Separator className="my-4 bg-gray-800" />
                  
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Conteúdo */}
            <div className="lg:col-span-3">
              {/* Perfil */}
              {activeTab === 'profile' && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Informações do Perfil</CardTitle>
                    <CardDescription className="text-gray-400">
                      Atualize suas informações pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-red-600 text-white text-xl">
                          {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" className="border-gray-700">
                          Alterar Foto
                        </Button>
                        <p className="text-sm text-gray-400 mt-1">
                          JPG, PNG ou GIF. Máximo 2MB.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-800 border-gray-700"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        O e-mail não pode ser alterado
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Segurança */}
              {activeTab === 'security' && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription className="text-gray-400">
                      Mantenha sua conta segura com uma senha forte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="bg-gray-800 border-gray-700 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-gray-800"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSavePassword}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isLoading ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Preferências */}
              {activeTab === 'preferences' && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Preferências do Sistema</CardTitle>
                    <CardDescription className="text-gray-400">
                      Personalize sua experiência no Leão Live
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="language">Idioma</Label>
                      <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="theme">Tema</Label>
                      <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="auto">Automático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quality">Qualidade Padrão de Vídeo</Label>
                      <Select value={preferences.quality} onValueChange={(value) => setPreferences(prev => ({ ...prev, quality: value }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Automático</SelectItem>
                          <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                          <SelectItem value="720p">HD (720p)</SelectItem>
                          <SelectItem value="480p">SD (480p)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoplay">Reprodução Automática</Label>
                        <p className="text-sm text-gray-400">
                          Reproduzir próximo episódio automaticamente
                        </p>
                      </div>
                      <Switch
                        id="autoplay"
                        checked={preferences.autoplay}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoplay: checked }))}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSavePreferences}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Preferências'}
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Notificações */}
              {activeTab === 'notifications' && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Configurações de Notificação</CardTitle>
                    <CardDescription className="text-gray-400">
                      Controle como e quando você recebe notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications">Notificações Push</Label>
                        <p className="text-sm text-gray-400">
                          Receber notificações no navegador
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={preferences.notifications}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notifications: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Notificações por E-mail</Label>
                        <p className="text-sm text-gray-400">
                          Receber atualizações e novidades por e-mail
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Ajuda */}
              {activeTab === 'help' && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Ajuda e Suporte</CardTitle>
                    <CardDescription className="text-gray-400">
                      Encontre respostas para suas dúvidas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">Central de Ajuda</h3>
                          <p className="text-sm text-gray-400 mb-3">
                            Artigos e tutoriais para usar o Leão Live
                          </p>
                          <Button variant="outline" className="border-gray-600 w-full">
                            Acessar Central
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">Contato Suporte</h3>
                          <p className="text-sm text-gray-400 mb-3">
                            Fale conosco para ajuda personalizada
                          </p>
                          <Button variant="outline" className="border-gray-600 w-full">
                            Enviar Mensagem
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Perguntas Frequentes</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-1">Como adicionar listas M3U?</h4>
                          <p className="text-sm text-gray-400">
                            Vá em "Gerenciar Listas M3U" no menu e clique em "Adicionar Nova Lista".
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-1">O que são "Meus Lions"?</h4>
                          <p className="text-sm text-gray-400">
                            É sua lista de favoritos onde você salva filmes, séries e canais para acesso rápido.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-1">Como alterar a qualidade do vídeo?</h4>
                          <p className="text-sm text-gray-400">
                            Vá em Configurações > Preferências e selecione a qualidade desejada.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;