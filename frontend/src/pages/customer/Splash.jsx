import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('/onboarding', { replace: true }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="theme-dark min-h-screen bg-fp-navy flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-fp-mid to-fp-navy" />
      <div className="fp-grain absolute inset-0" />
      <div className="relative animate-fade-in-up text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-fp-gold to-fp-red flex items-center justify-center fp-glow-gold">
          <Fuel className="w-12 h-12 text-fp-navy" strokeWidth={2.5} />
        </div>
        <h1 className="font-display text-5xl text-white">FuelPro</h1>
        <p className="text-fp-text text-sm mt-3 tracking-wider uppercase">Rewards</p>
      </div>
    </div>
  );
}
