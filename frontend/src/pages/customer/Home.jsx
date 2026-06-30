import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Bell, Fuel, Coffee, Sparkles, Droplets, Ticket, ChevronRight, TrendingUp, Gift, ScanLine, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import TierBadge from '@/components/customer/TierBadge';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [inboxUnread, setInboxUnread] = useState(0);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    api.get('/users/me/tier-progress').then(r => setProgress(r.data.data)).catch(() => {});
    api.get('/coupons').then(r => setCoupons(r.data.data.slice(0, 6))).catch(() => {});
    api.get('/notifications/inbox').then(r => setInboxUnread(r.data.data.filter(n => !n.is_read).length)).catch(() => {});
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const tier = progress?.current;

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-fp-text text-xs uppercase tracking-wider">Good day,</p>
          <h1 className="font-display text-2xl mt-1">{firstName} 👋</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="relative w-11 h-11 rounded-2xl bg-fp-gold border border-fp-gold flex items-center justify-center fp-press shadow-lg"
          >
            <ScanLine className="w-5 h-5 text-fp-navy" />
          </button>
          
          <button
            data-testid="home-notification-bell"
            onClick={() => navigate('/notifications')}
            className="relative w-11 h-11 rounded-2xl bg-fp-mid border border-white/5 flex items-center justify-center fp-press"
          >
            <Bell className="w-5 h-5 text-white" />
            {inboxUnread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-fp-red text-white text-[10px] font-bold flex items-center justify-center">
                {inboxUnread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Points Card */}
      <Link
        to="/rewards"
        data-testid="home-points-card"
        className="block relative overflow-hidden rounded-3xl bg-gradient-to-br from-fp-mid to-fp-navy border border-fp-gold/30 p-6 fp-glow-gold mb-6 fp-press"
      >
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-fp-gold/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-fp-red/15 blur-3xl pointer-events-none" />

        <div className="relative pointer-events-none">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-fp-text text-xs uppercase tracking-wider">Available Points</p>
              <p className="font-display text-5xl text-fp-gold mt-1" data-testid="home-points-balance">
                {user?.total_points ?? 0}
              </p>
            </div>
            {tier && <TierBadge tier={tier} size="lg" />}
          </div>

          {progress?.next && (
            <>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fp-gold to-fp-red rounded-full transition-all duration-700"
                  style={{ width: `${progress.progress_pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-fp-text">{progress.points_to_next} pts to {progress.next.name}</span>
                <span className="text-fp-gold font-semibold">{progress.progress_pct}%</span>
              </div>
            </>
          )}
        </div>
      </Link>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { icon: Fuel,     label: 'Fuel',     color: 'text-fp-red',   to: '/coupons?type=FUEL',    testid: 'qa-fuel' },
          { icon: Ticket,   label: 'Coupons',  color: 'text-fp-gold',  to: '/coupons',              testid: 'qa-coupons' },
          { icon: Droplets, label: 'Wash',     color: 'text-blue-400', to: '/coupons?type=CARWASH', testid: 'qa-wash' },
          { icon: Coffee,   label: 'Coffee',   color: 'text-amber-200', to: '/coupons?type=COFFEE', testid: 'qa-coffee' },
        ].map(({ icon: Icon, label, color, to, testid }) => (
          <Link key={label} to={to} data-testid={testid}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-fp-mid border border-white/5 fp-press">
            <Icon className={`w-6 h-6 ${color}`} strokeWidth={2} />
            <span className="text-[11px] uppercase tracking-wider font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      {/* Play & Win Banner */}
      <Link to="/gamification" className="block mb-8 rounded-2xl bg-gradient-to-r from-fp-gold/20 to-fp-red/20 border border-fp-gold/30 p-4 fp-press overflow-hidden relative">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-fp-gold/10 to-transparent" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-fp-gold text-fp-navy flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display text-lg text-white">Play & Win</p>
              <p className="text-xs text-fp-text">Scratch daily for bonus points!</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-fp-gold" />
        </div>
      </Link>

      {/* Featured offers */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-fp-gold" /> Featured Offers
        </h2>
        <Link to="/coupons" className="text-fp-gold text-xs font-semibold flex items-center gap-1">
          See all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="-mx-5 px-5 flex gap-3 overflow-x-auto fp-no-scrollbar pb-2">
        {coupons.map(c => (
          <Link
            key={c.id}
            to={`/coupons/${c.id}`}
            data-testid={`home-coupon-${c.id}`}
            className="min-w-[240px] rounded-2xl overflow-hidden bg-fp-mid border border-white/5 fp-press"
          >
            <div className="relative h-28 bg-fp-navy">
              {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover opacity-70" />}
              <div className="absolute inset-0 bg-gradient-to-t from-fp-mid to-transparent" />
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-fp-gold text-fp-navy text-[10px] font-bold uppercase tracking-wider">
                {c.type}
              </div>
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm leading-snug line-clamp-1">{c.title}</p>
              <p className="text-fp-text text-xs mt-1 line-clamp-1">{c.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick stats */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <Link to="/history" data-testid="home-history-link"
          className="p-4 rounded-2xl bg-fp-mid border border-white/5 fp-press">
          <TrendingUp className="w-5 h-5 text-fp-green mb-2" />
          <p className="text-xs text-fp-text uppercase tracking-wider">Lifetime</p>
          <p className="font-display text-xl mt-1">{user?.lifetime_points ?? 0} pts</p>
        </Link>
        <Link to="/profile" data-testid="home-profile-link"
          className="p-4 rounded-2xl bg-fp-mid border border-white/5 fp-press">
          <Sparkles className="w-5 h-5 text-fp-gold mb-2" />
          <p className="text-xs text-fp-text uppercase tracking-wider">Referral</p>
          <p className="font-mono text-sm mt-1 text-fp-gold truncate">{user?.referral_code}</p>
        </Link>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-5"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white text-fp-navy p-8 rounded-3xl w-full max-w-sm flex flex-col items-center relative shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-fp-navy bg-gray-100 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 rounded-full bg-fp-gold text-fp-navy flex items-center justify-center mb-4 shadow-lg">
                <ScanLine className="w-6 h-6" />
              </div>
              
              <h2 className="text-2xl font-display font-bold mb-1">Member Pass</h2>
              <p className="text-sm text-gray-500 mb-8 text-center font-medium">Scan this at the pump or register to earn points and apply coupons.</p>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <QRCodeSVG value={user?.id || 'demo-user-123'} size={200} level="H" includeMargin />
              </div>
              
              <p className="font-mono text-sm tracking-widest mt-6 text-gray-400">{user?.id?.split('-')[0] || 'DEMO'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
