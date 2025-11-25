import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaoLiveLogo } from '@/components/ui/logo';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver autenticado
  React.useEffect(() => {
    if (user && !loading) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LeaoLiveLogo size="large" className="mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Super organização e performance em design cinematográfico</p>
        </div>

        {isSignUp ? (
          <SignUpForm onToggleMode={toggleMode} />
        ) : (
          <LoginForm />
        )}

        {!isSignUp && (
          <div className="mt-4 text-center">
            <button
              onClick={toggleMode}
              className="text-gray-400 hover:text-gray-300 hover:underline text-sm"
            >
              Não tem uma conta? Criar uma Conta
            </button>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Login;