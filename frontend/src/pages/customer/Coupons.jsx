import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Ticket, Loader2, Wallet, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TYPES = [
  { id: 'ALL',     label: 'All' },
  { id: 'FUEL',    label: 'Fuel' },
  { id: 'COFFEE',  label: 'Coffee' },
  { id: 'STORE',   label: 'Store' },
  { id: 'CARWASH', label: 'Wash' },
];

export default function Coupons() {
  const [params] = useSearchParams();
  const initialType = params.get('type') || 'ALL';
  const [type, setType] = useState(initialType);
  const [coupons, setCoupons] = useState([]);
  const [wallet, setWallet] = useState([]);
  const [view, setView] = useState('browse'); // browse | wallet
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [c, w] = await Promise.all([api.get('/coupons'), api.get('/coupons/wallet')]);
      setCoupons(c.data.data);
      setWallet(w.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const claim = async (id) => {
    try {
      await api.post(`/coupons/${id}/claim`);
      toast.success('Coupon added to your wallet!');
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not claim');
    }
  };

  const filtered = type === 'ALL' ? coupons : coupons.filter(c => c.type === type);
  const walletCouponIds = new Set(wallet.map(r => r.coupon_id));

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in-up">
      <h1 className="font-display text-3xl mb-1">Offers</h1>
      <p className="text-fp-text text-sm mb-5">Stack savings on every visit.</p>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          data-testid="coupons-view-browse"
          onClick={() => setView('browse')}
          className={`h-11 rounded-xl font-semibold text-sm fp-press flex items-center justify-center gap-2 ${
            view === 'browse' ? 'bg-fp-gold text-fp-navy' : 'bg-fp-mid text-fp-text border border-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Browse
        </button>
        <button
          data-testid="coupons-view-wallet"
          onClick={() => setView('wallet')}
          className={`h-11 rounded-xl font-semibold text-sm fp-press flex items-center justify-center gap-2 ${
            view === 'wallet' ? 'bg-fp-gold text-fp-navy' : 'bg-fp-mid text-fp-text border border-white/5'
          }`}
        >
          <Wallet className="w-4 h-4" /> My Wallet ({wallet.length})
        </button>
      </div>

      {view === 'browse' && (
        <Tabs value={type} onValueChange={setType} className="mb-4">
          <TabsList className="w-full overflow-x-auto fp-no-scrollbar bg-transparent justify-start gap-2 h-auto p-0">
            {TYPES.map(t => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                data-testid={`coupons-filter-${t.id}`}
                className="px-4 h-9 rounded-full bg-fp-mid border border-white/5 text-fp-text data-[state=active]:bg-fp-gold data-[state=active]:text-fp-navy data-[state=active]:border-transparent flex-shrink-0"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-fp-gold" /></div>
      ) : view === 'browse' ? (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-fp-text">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No offers in this category yet.</p>
            </div>
          )}
          {filtered.map(c => (
            <div key={c.id} data-testid={`coupon-card-${c.id}`}
              className="rounded-2xl bg-fp-mid border border-white/5 overflow-hidden">
              <div className="flex">
                <div className="w-24 h-24 bg-fp-navy flex-shrink-0 relative">
                  {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 bg-fp-gold/15 text-fp-gold text-[10px] font-bold uppercase rounded">{c.type}</span>
                      {c.discount_type === 'PERCENTAGE' && c.discount_value > 0 && (
                        <span className="text-fp-red text-xs font-bold">{c.discount_value}% OFF</span>
                      )}
                      {c.discount_type === 'FIXED' && c.discount_value > 0 && (
                        <span className="text-fp-red text-xs font-bold">${c.discount_value} OFF</span>
                      )}
                      {c.discount_type === 'FREE_ITEM' && (
                        <span className="text-fp-green text-xs font-bold">FREE</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold line-clamp-1">{c.title}</p>
                    <p className="text-fp-text text-xs line-clamp-1 mt-0.5">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {walletCouponIds.has(c.id) ? (
                      <Link
                        to={`/coupons/${c.id}`}
                        data-testid={`coupon-view-${c.id}`}
                        className="flex-1 h-9 rounded-lg bg-fp-gold text-fp-navy text-xs font-bold flex items-center justify-center fp-press"
                      >Show QR</Link>
                    ) : (
                      <button
                        onClick={() => claim(c.id)}
                        data-testid={`coupon-claim-${c.id}`}
                        className="flex-1 h-9 rounded-lg bg-white/10 text-white text-xs font-bold border border-white/10 fp-press"
                      >Claim</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {wallet.length === 0 && (
            <div className="text-center py-16 text-fp-text">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="mb-4">Your wallet is empty.</p>
              <button onClick={() => setView('browse')} data-testid="wallet-browse-cta"
                className="px-5 h-11 rounded-xl bg-fp-gold text-fp-navy font-bold text-sm fp-press">
                Browse Offers
              </button>
            </div>
          )}
          {wallet.map(r => (
            <Link key={r.id} to={`/coupons/${r.coupon_id}`} data-testid={`wallet-item-${r.coupon_id}`}
              className="block rounded-2xl bg-fp-mid border border-fp-gold/30 overflow-hidden fp-press fp-glow-gold">
              <div className="flex">
                <div className="w-24 h-24 bg-fp-navy flex-shrink-0">
                  {r.coupon?.image_url && <img src={r.coupon.image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 p-3">
                  <span className="px-1.5 py-0.5 bg-fp-gold/15 text-fp-gold text-[10px] font-bold uppercase rounded">{r.coupon?.type}</span>
                  <p className="text-sm font-semibold mt-1 line-clamp-1">{r.coupon?.title}</p>
                  <p className="text-fp-gold text-xs font-semibold mt-2 flex items-center gap-1">
                    <Ticket className="w-3 h-3" /> Tap to show QR
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
