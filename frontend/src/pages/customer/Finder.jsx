import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Star, Fuel, CheckCircle, ChevronDown, Crosshair } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function Finder() {
  const [stations, setStations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [primaryId, setPrimaryId] = useState(1);

  useEffect(() => {
    api.get('/locations').then(res => {
      const fetched = res.data.data;
      const coordsList = [
          { x: 30, y: 40 }, { x: 70, y: 20 }, { x: 20, y: 75 }, { x: 80, y: 80 },
          { x: 50, y: 50 }, { x: 10, y: 20 }, { x: 90, y: 40 }, { x: 40, y: 90 }
      ];
      const mapped = fetched.map((loc, idx) => {
        const retail = loc.fuel_prices?.find(f => f.grade === 'regular')?.price || 3.59;
        const member = retail - 0.20;
        return {
           ...loc,
           distance: (Math.random() * 5 + 0.5).toFixed(1) + ' mi',
           retail,
           member,
           coords: coordsList[idx % coordsList.length]
        };
      });
      setStations(mapped);
      if(mapped.length > 0) setPrimaryId(mapped[0].id);
    }).catch(() => {});
  }, []);

  const handleSetPrimary = (station) => {
    setPrimaryId(station.id);
    toast.success(`Set ${station.name} as Primary!`, {
      description: '+20 Bonus Points applied for your next visit.'
    });
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white flex flex-col relative overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-fp-navy border-b border-white/5 relative z-20">
        <h1 className="font-display text-2xl">Station Finder</h1>
        <p className="text-fp-text text-sm mt-1">Tap a node to view exclusive pricing</p>
      </div>

      {/* Vector Map Canvas */}
      <div className="flex-1 relative bg-[#040A14] overflow-hidden">
        {/* Grid lines */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#F5A623 1px, transparent 1px), linear-gradient(90deg, #F5A623 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Stylized Streets (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <path d="M 0,200 Q 150,250 400,100" fill="none" stroke="#FFFFFF" strokeWidth="4" />
          <path d="M 100,0 L 150,800" fill="none" stroke="#FFFFFF" strokeWidth="4" />
          <path d="M 0,600 Q 200,550 400,700" fill="none" stroke="#FFFFFF" strokeWidth="6" />
          <path d="M 300,0 L 250,800" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        </svg>

        {/* User Location Node (Pulsing Cyan) */}
        <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute w-12 h-12 rounded-full bg-cyan-400/20"
              animate={{ scale: [1, 2], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            />
            <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-[#040A14] shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
          </div>
        </div>

        {/* Station Nodes */}
        {stations.map((station) => (
          <button
            key={station.id}
            onClick={() => setSelected(station)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 fp-press z-10"
            style={{ left: `${station.coords.x}%`, top: `${station.coords.y}%` }}
          >
            <div className="relative flex flex-col items-center">
              {primaryId === station.id && (
                <div className="absolute -top-6 bg-fp-gold text-fp-navy text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                  Primary
                </div>
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
                selected?.id === station.id 
                  ? 'bg-fp-red border-white text-white' 
                  : primaryId === station.id 
                    ? 'bg-fp-gold border-[#0A1628] text-fp-navy'
                    : 'bg-fp-navy border-fp-gold/50 text-fp-gold'
              }`}>
                <Fuel className="w-5 h-5" />
              </div>
              <span className="mt-1 text-[10px] font-bold text-white bg-[#0A1628]/80 px-1.5 py-0.5 rounded shadow-sm">
                {station.name.replace('FuelPro ', '')}
              </span>
            </div>
          </button>
        ))}

        {/* Re-center FAB */}
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-fp-navy/80 backdrop-blur border border-white/10 flex items-center justify-center text-fp-text fp-press z-10 shadow-lg">
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      {/* Detail Sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 inset-x-0 bg-fp-navy rounded-t-3xl p-6 z-40 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" onClick={() => setSelected(null)} />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-display text-2xl">{selected.name}</h2>
                  <p className="text-fp-text text-sm mt-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> {selected.distance} • {selected.address}
                  </p>
                </div>
                {primaryId === selected.id && (
                  <div className="w-8 h-8 rounded-full bg-fp-gold/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-fp-gold fill-fp-gold" />
                  </div>
                )}
              </div>

              {/* Loyalty Calculator */}
              <div className="bg-fp-mid rounded-2xl p-4 border border-white/5 mb-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-fp-gold/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <h3 className="text-xs uppercase tracking-wider text-fp-text font-bold mb-3">Live Pump Pricing</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Standard Retail</p>
                    <p className="text-xl font-mono text-white/50 line-through decoration-fp-red decoration-2">${selected.retail.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-fp-gold text-sm font-bold mb-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-fp-gold" /> Member Rate
                    </p>
                    <p className="text-3xl font-mono font-bold text-white">${selected.member.toFixed(2)}</p>
                    <p className="text-[10px] text-fp-green font-bold uppercase mt-1">You save ${(selected.retail - selected.member).toFixed(2)}/gal</p>
                  </div>
                </div>
              </div>

              {primaryId === selected.id ? (
                <button disabled className="w-full h-12 rounded-xl bg-white/5 text-white/50 font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> This is your Primary Station
                </button>
              ) : (
                <button
                  onClick={() => handleSetPrimary(selected)}
                  className="w-full h-12 rounded-xl bg-fp-gold text-fp-navy font-bold text-sm fp-press"
                >
                  Set as Primary Station (+20 pts)
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
