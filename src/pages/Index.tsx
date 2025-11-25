import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a página de login
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Leão Live</h1>
        <p className="text-xl text-gray-400">
          Redirecionando...
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;