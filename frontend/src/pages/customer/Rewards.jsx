import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Award, TrendingUp, Loader2 } from 'lucide-react';
import TierBadge from '@/components/customer/TierBadge';

const TIER_PERK_ICON = {
  Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎',
};

export default function Rewards() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/users/me/tier-progress').then(r => setProgress(r.data.data));
    api.get('/points/history').then(r => setHistory(r.data.data));
  }, []);

  if (!progress) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-fp-gold" /></div>;
  }

  const radius = 78;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress.progress_pct / 100) * circ;

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in-up">
      <h1 className="font-display text-3xl mb-1">Rewards</h1>
      <p className="text-fp-text text-sm mb-6">Every point gets you closer.</p>

      <div className="rounded-3xl bg-gradient-to-br from-fp-mid to-fp-navy border border-fp-gold/20 p-6 fp-glow-gold mb-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" className="-rotate-90">
              <circle cx="100" cy="100" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
              <circle
                cx="100" cy="100" r={radius}
                stroke="url(#tier-grad)" strokeWidth="10" fill="none" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
              <defs>
                <linearGradient id="tier-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F5A623" />
                  <stop offset="100%" stopColor="#E8132A" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-fp-text text-[10px] uppercase tracking-widest">Balance</p>
              <p className="font-display text-4xl text-fp-gold mt-1" data-testid="rewards-balance">{user?.total_points ?? 0}</p>
              <p className="text-fp-text text-xs mt-1">points</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <TierBadge tier={progress.current} size="lg" />
          {progress.next && (
            <span className="text-fp-text text-xs">
              {progress.points_to_next} pts to <span className="text-fp-gold font-semibold">{progress.next.name}</span>
            </span>
          )}
        </div>
      </div>

      <h2 className="font-display text-lg mb-3 flex items-center gap-2">
        <Award className="w-4 h-4 text-fp-gold" /> Tier Benefits
      </h2>
      <div className="space-y-2 mb-6">
        {progress.all_tiers.map(t => {
          const isCurrent = t.id === progress.current.id;
          return (
            <div key={t.id} data-testid={`tier-row-${t.name}`}
              className={`p-4 rounded-2xl border ${isCurrent ? 'bg-fp-mid border-fp-gold/50' : 'bg-fp-mid/50 border-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{TIER_PERK_ICON[t.name]}</span>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-fp-text text-xs">{t.min_points.toLocaleString()}+ pts · {t.multiplier}x multiplier</p>
                  </div>
                </div>
                {isCurrent && <TierBadge tier={t} size="sm" />}
              </div>
              <ul className="mt-3 space-y-1">
                {t.benefits.map((b, i) => (
                  <li key={i} className="text-fp-text text-xs flex items-start gap-2">
                    <span className="text-fp-green mt-0.5">✓</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <h2 className="font-display text-lg mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-fp-green" /> Recent Activity
      </h2>
      <div className="space-y-2">
        {history.length === 0 && <p className="text-fp-text text-sm text-center py-8">No activity yet — make a purchase to start earning!</p>}
        {history.map(h => (
          <div key={h.id} data-testid={`points-txn-${h.id}`}
            className="flex items-center justify-between p-3 rounded-xl bg-fp-mid border border-white/5">
            <div>
              <p className="text-sm font-medium">{h.description}</p>
              <p className="text-fp-text text-xs mt-0.5">
                {new Date(h.created_at).toLocaleDateString()} · {h.type}
              </p>
            </div>
            <p className={`font-display text-lg ${h.points >= 0 ? 'text-fp-green' : 'text-fp-red'}`}>
              {h.points >= 0 ? '+' : ''}{h.points}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
