import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { LogOut, Copy, Users, Receipt, ShieldCheck, ChevronRight, Car, Activity, Plus, Trash2, GaugeCircle } from 'lucide-react';
import TierBadge from '@/components/customer/TierBadge';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [tier, setTier] = useState(null);

  // Vehicle Efficiency Tracker State
  const [logs, setLogs] = useState([
    { id: '1', date: 'Oct 12', vehicle: 'My Honda', miles: 320, gallons: 11.5, price: 3.59, mpg: 27.8 },
    { id: '2', date: 'Oct 05', vehicle: 'My Honda', miles: 285, gallons: 10.2, price: 3.65, mpg: 27.9 },
  ]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [form, setForm] = useState({ vehicle: 'My Honda', miles: '', gallons: '', price: '' });

  useEffect(() => {
    api.get('/users/me/referral-stats').then(r => setReferral(r.data.data)).catch(()=>null);
    api.get('/users/me/tier-progress').then(r => setTier(r.data.data.current)).catch(()=>null);
  }, []);

  const initials = (user?.name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  const copyRef = async () => {
    await navigator.clipboard?.writeText(user.referral_code);
    toast.success('Referral code copied');
  };

  const calculateAvgMpg = () => {
    if (logs.length === 0) return 0;
    const totalMiles = logs.reduce((sum, log) => sum + Number(log.miles), 0);
    const totalGallons = logs.reduce((sum, log) => sum + Number(log.gallons), 0);
    return (totalMiles / totalGallons).toFixed(1);
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!form.miles || !form.gallons) return toast.error('Please enter miles and gallons');
    
    const mpg = (Number(form.miles) / Number(form.gallons)).toFixed(1);
    const newLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      vehicle: form.vehicle || 'Unknown',
      miles: Number(form.miles),
      gallons: Number(form.gallons),
      price: Number(form.price) || 0,
      mpg: Number(mpg)
    };

    setLogs([newLog, ...logs]);
    setForm({ ...form, miles: '', gallons: '', price: '' });
    setShowLogForm(false);
    toast.success('Trip logged successfully!');
  };

  const deleteLog = (id) => {
    setLogs(logs.filter(l => l.id !== id));
    toast.success('Log deleted');
  };

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in-up">
      <h1 className="font-display text-3xl mb-6">Profile</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fp-gold to-fp-red flex items-center justify-center font-display text-2xl text-fp-navy shadow-lg">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xl truncate" data-testid="profile-name">{user?.name}</p>
          <p className="text-fp-text text-sm truncate">{user?.email}</p>
          {tier && <div className="mt-2"><TierBadge tier={tier} size="sm" /></div>}
        </div>
      </div>

      {/* Vehicle Efficiency Tracker */}
      <div className="mb-8">
        <h2 className="font-display text-lg mb-3 flex items-center gap-2">
          <Car className="w-5 h-5 text-cyan-400" /> Efficiency Tracker
        </h2>
        
        {/* Fuel Economy Metrics Card */}
        <div className="rounded-3xl bg-gradient-to-br from-fp-navy to-[#0A1628] border border-cyan-400/30 p-6 mb-4 shadow-[0_4px_20px_rgba(34,211,238,0.1)] relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-fp-text text-xs uppercase tracking-wider font-semibold mb-1">Average MPG</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-cyan-400">{calculateAvgMpg()}</span>
                <span className="text-sm font-bold text-fp-text">mpg</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-cyan-400/20 flex items-center justify-center">
              <GaugeCircle className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!showLogForm ? (
          <button 
            onClick={() => setShowLogForm(true)}
            className="w-full py-3.5 rounded-xl border border-dashed border-white/20 text-fp-text font-semibold flex items-center justify-center gap-2 hover:bg-white/5 fp-press mb-4"
          >
            <Plus className="w-4 h-4" /> Log Fuel Up
          </button>
        ) : (
          <form onSubmit={handleLogSubmit} className="bg-fp-mid p-5 rounded-2xl border border-white/10 mb-4 animate-fade-in-up">
            <h3 className="font-semibold text-sm mb-4">New Fuel Log</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-fp-text mb-1 block">Vehicle Nickname</label>
                <input type="text" value={form.vehicle} onChange={e => setForm({...form, vehicle: e.target.value})} className="w-full bg-fp-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-fp-text mb-1 block">Miles Traveled</label>
                  <input type="number" step="0.1" required value={form.miles} onChange={e => setForm({...form, miles: e.target.value})} className="w-full bg-fp-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400" placeholder="e.g. 300" />
                </div>
                <div>
                  <label className="text-xs text-fp-text mb-1 block">Gallons</label>
                  <input type="number" step="0.01" required value={form.gallons} onChange={e => setForm({...form, gallons: e.target.value})} className="w-full bg-fp-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400" placeholder="e.g. 12.5" />
                </div>
              </div>
              <div>
                <label className="text-xs text-fp-text mb-1 block">Price per Gallon ($)</label>
                <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-fp-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400" placeholder="e.g. 3.59" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={() => setShowLogForm(false)} className="flex-1 py-2.5 rounded-lg border border-white/10 font-semibold text-sm text-fp-text fp-press">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm fp-press">Save Log</button>
            </div>
          </form>
        )}

        {/* History List */}
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="bg-fp-mid rounded-xl p-4 flex items-center justify-between border border-white/5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{log.mpg} MPG</span>
                  <span className="text-[10px] uppercase text-fp-text bg-white/5 px-2 py-0.5 rounded">{log.date}</span>
                </div>
                <p className="text-xs text-fp-text">{log.miles} mi • {log.gallons} gal {log.price ? `• $${log.price}/gal` : ''}</p>
              </div>
              <button onClick={() => deleteLog(log.id)} className="p-2 text-fp-text hover:text-fp-red transition-colors fp-press">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Referral card */}
      <div className="rounded-2xl bg-gradient-to-br from-fp-mid to-fp-navy border border-fp-gold/20 p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-fp-gold" />
          <p className="text-xs uppercase tracking-wider text-fp-text font-semibold">Refer & Earn</p>
        </div>
        <p className="text-sm text-white/80 mb-4">Share your code. Both of you get <span className="text-fp-gold font-bold">200 points</span> on their first purchase.</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 h-11 rounded-xl bg-fp-navy border border-white/10 flex items-center font-mono text-sm text-fp-gold" data-testid="profile-referral-code">
            {user?.referral_code}
          </div>
          <button onClick={copyRef} data-testid="profile-referral-copy"
            className="h-11 px-4 rounded-xl bg-fp-gold text-fp-navy font-bold text-xs flex items-center gap-1.5 fp-press">
            <Copy className="w-4 h-4" /> Copy
          </button>
        </div>
        {referral && (
          <p className="text-xs text-fp-text mt-3"><span className="text-fp-green font-semibold">{referral.friends_joined}</span> friends joined</p>
        )}
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {user?.role === 'admin' && (
          <button onClick={() => navigate('/admin')} data-testid="profile-admin-link"
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-fp-mid border border-white/5 fp-press">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-fp-gold" />
              <span className="font-semibold">Admin Dashboard</span>
            </div>
            <ChevronRight className="w-4 h-4 text-fp-text" />
          </button>
        )}
        <button onClick={() => navigate('/history')} data-testid="profile-history-link"
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-fp-mid border border-white/5 fp-press">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-fp-text" />
            <span className="font-semibold">Purchase History</span>
          </div>
          <ChevronRight className="w-4 h-4 text-fp-text" />
        </button>
        <button onClick={async () => { await logout(); navigate('/auth', { replace: true }); }} data-testid="profile-logout"
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-fp-mid border border-white/5 fp-press">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-fp-red" />
            <span className="font-semibold text-fp-red">Sign Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-fp-text" />
        </button>
      </div>

      <p className="text-center text-fp-text text-xs mt-10">FuelPro Rewards · v1.0</p>
    </div>
  );
}
