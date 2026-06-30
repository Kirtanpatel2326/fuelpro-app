import { useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Coins, CheckCircle, Sparkles } from 'lucide-react';

export default function Gamification() {
  const [isScratching, setIsScratching] = useState(false);
  const [revealedPoints, setRevealedPoints] = useState(null);

  const handleScratch = async () => {
    setIsScratching(true);
    // Simulate API call to reveal points
    setTimeout(() => {
      const points = [10, 20, 50, 100][Math.floor(Math.random() * 4)];
      setRevealedPoints(points);
      setIsScratching(false);
    }, 1500);
  };

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in-up h-full bg-fp-navy text-white min-h-screen">
      <h1 className="font-display text-3xl mb-1 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-fp-gold" />
        Play & Win
      </h1>
      <p className="text-fp-text text-sm mb-6">Earn extra points every day!</p>

      {/* Scratch Card UI */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-8 bg-gradient-to-br from-[#1A2942] to-[#112240]">
        <AnimatePresence mode="wait">
          {!revealedPoints ? (
            <motion.div
              key="unrevealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer"
              onClick={handleScratch}
            >
              {isScratching ? (
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-4 border-fp-gold border-t-transparent"
                  />
                  <p className="font-bold text-lg text-fp-gold animate-pulse">Scratching...</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-fp-gold to-fp-red rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,166,35,0.4)]">
                    <Gift className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mb-2">Daily Scratch Card</h2>
                  <p className="text-fp-text text-sm max-w-[200px]">Tap to scratch and reveal your daily bonus points!</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="absolute inset-0 bg-gradient-to-br from-fp-green/20 to-transparent flex flex-col items-center justify-center p-6 text-center"
            >
              <CheckCircle className="w-16 h-16 text-fp-green mb-4" />
              <h2 className="text-3xl font-black tracking-tight text-white mb-2">You Won!</h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-display text-fp-gold drop-shadow-lg">+{revealedPoints}</span>
                <span className="text-fp-gold font-bold">pts</span>
              </div>
              <button 
                onClick={() => setRevealedPoints(null)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-semibold"
              >
                Awesome!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Other Challenges */}
      <h2 className="font-display text-lg mb-4">Active Challenges</h2>
      <div className="space-y-3">
        <div className="bg-fp-mid/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
              <Coins className="text-fp-gold w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">Weekend Warrior</p>
              <p className="text-xs text-fp-text mt-1">Fill up 2x this weekend.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-fp-gold font-bold">+500 pts</p>
            <p className="text-xs text-fp-text mt-1">0/2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
