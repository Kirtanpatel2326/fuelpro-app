import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Fuel, ChevronLeft, Plus, Coffee, Droplets, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const TYPE_ICON = { FUEL: Fuel, COFFEE: Coffee, CARWASH: Droplets, STORE: ShoppingBag };

export default function PurchaseHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'FUEL', gallons: '', fuel_grade: 'regular' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await api.get('/purchases/history');
    setItems(r.data.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        type: form.type,
        gallons: form.gallons ? parseFloat(form.gallons) : null,
        fuel_grade: form.type === 'FUEL' ? form.fuel_grade : null,
      };
      const r = await api.post('/purchases', payload);
      toast.success(`Earned ${r.data.data.points_earned} points! 🎉`);
      setOpen(false);
      setForm({ amount: '', type: 'FUEL', gallons: '', fuel_grade: 'regular' });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not log purchase');
    } finally { setBusy(false); }
  };

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} data-testid="history-back"
          className="w-10 h-10 rounded-full bg-fp-mid flex items-center justify-center fp-press">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl">Purchase History</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button data-testid="history-add-purchase" className="w-10 h-10 rounded-full bg-fp-gold flex items-center justify-center fp-press">
              <Plus className="w-5 h-5 text-fp-navy" strokeWidth={3} />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-fp-mid border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="font-display">Log a Purchase</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label className="text-fp-text text-xs uppercase">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger data-testid="purchase-type-select" className="mt-2 bg-fp-navy border-white/10 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FUEL">Fuel</SelectItem>
                    <SelectItem value="STORE">Store</SelectItem>
                    <SelectItem value="COFFEE">Coffee</SelectItem>
                    <SelectItem value="CARWASH">Car Wash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-fp-text text-xs uppercase">Amount ($)</Label>
                <Input type="number" step="0.01" min="0.01" required data-testid="purchase-amount"
                  value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="mt-2 bg-fp-navy border-white/10 h-11" />
              </div>
              {form.type === 'FUEL' && (
                <>
                  <div>
                    <Label className="text-fp-text text-xs uppercase">Gallons</Label>
                    <Input type="number" step="0.01" data-testid="purchase-gallons"
                      value={form.gallons} onChange={(e) => setForm({ ...form, gallons: e.target.value })}
                      className="mt-2 bg-fp-navy border-white/10 h-11" />
                  </div>
                  <div>
                    <Label className="text-fp-text text-xs uppercase">Grade</Label>
                    <Select value={form.fuel_grade} onValueChange={(v) => setForm({ ...form, fuel_grade: v })}>
                      <SelectTrigger className="mt-2 bg-fp-navy border-white/10 h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="plus">Plus</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <DialogFooter>
                <Button type="submit" disabled={busy} data-testid="purchase-submit"
                  className="w-full h-12 bg-fp-gold text-fp-navy font-bold hover:bg-fp-gold/90 rounded-xl">
                  {busy ? 'Saving…' : 'Log Purchase'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-fp-text">
          <Fuel className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No purchases yet — tap + to log your first.</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map(p => {
          const Icon = TYPE_ICON[p.type] || ShoppingBag;
          return (
            <div key={p.id} data-testid={`purchase-${p.id}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-fp-mid border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fp-navy flex items-center justify-center">
                  <Icon className="w-4 h-4 text-fp-gold" />
                </div>
                <div>
                  <p className="font-semibold text-sm">${p.amount.toFixed(2)} · {p.type.toLowerCase()}</p>
                  <p className="text-fp-text text-xs">
                    {new Date(p.created_at).toLocaleDateString()} {p.gallons ? `· ${p.gallons} gal ${p.fuel_grade}` : ''}
                  </p>
                </div>
              </div>
              <p className="font-display text-fp-green">+{p.points_earned}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
