import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronLeft, Loader2, Clock, Share2 } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export default function CouponDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);
  const [qr, setQr] = useState(null);
  const [claimedId, setClaimedId] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await api.get(`/coupons/${id}`);
        setCoupon(c.data.data);
        const wallet = await api.get('/coupons/wallet');
        const claim = wallet.data.data.find(r => r.coupon_id === id);
        if (claim) {
          setClaimedId(claim.id);
          await generateQr();
        }
      } catch {
        toast.error('Coupon not found');
        navigate('/coupons');
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const generateQr = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/coupons/${id}/generate-qr`);
      setQr(r.data.data);
      const expiresMs = new Date(r.data.data.expires_at).getTime() - Date.now();
      setCountdown(Math.max(0, Math.floor(expiresMs / 1000)));
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not generate QR');
    } finally { setBusy(false); }
  };

  const claim = async () => {
    try {
      await api.post(`/coupons/${id}/claim`);
      toast.success('Saved to wallet!');
      const wallet = await api.get('/coupons/wallet');
      const c = wallet.data.data.find(r => r.coupon_id === id);
      if (c) setClaimedId(c.id);
      await generateQr();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not claim');
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  if (!coupon) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-fp-gold" /></div>;
  }

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-fp-navy text-white pb-8 animate-fade-in-up">
      <div className="relative h-56 bg-fp-mid">
        {coupon.image_url && <img src={coupon.image_url} alt="" className="w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-fp-navy via-fp-navy/40 to-transparent" />
        <button
          data-testid="coupon-detail-back"
          onClick={() => navigate(-1)}
          className="absolute top-12 left-5 w-10 h-10 rounded-full bg-fp-navy/70 backdrop-blur flex items-center justify-center fp-press"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          data-testid="coupon-detail-share"
          onClick={() => {
            navigator.clipboard?.writeText(`Check this FuelPro offer: ${coupon.title}`);
            toast.success('Copied to clipboard!');
          }}
          className="absolute top-12 right-5 w-10 h-10 rounded-full bg-fp-navy/70 backdrop-blur flex items-center justify-center fp-press"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <span className="px-2.5 py-1 rounded-md bg-fp-gold text-fp-navy text-[10px] font-bold uppercase tracking-wider">{coupon.type}</span>
          <h1 className="font-display text-3xl mt-2 leading-tight">{coupon.title}</h1>
        </div>
      </div>

      <div className="px-5 pt-5">
        <p className="text-white/80 text-sm leading-relaxed">{coupon.description}</p>

        {/* QR area */}
        <div className="mt-6 rounded-3xl bg-fp-mid border border-fp-gold/20 p-6 text-center">
          {qr ? (
            <>
              <div className="inline-block p-5 rounded-2xl bg-white">
                <QRCodeSVG value={qr.token} size={208} fgColor="#0A1628" bgColor="#FFFFFF" level="H" />
              </div>
              <div className={`mt-5 flex items-center justify-center gap-2 ${countdown < 60 ? 'text-fp-red animate-pulse' : 'text-fp-gold'}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg font-bold" data-testid="coupon-qr-countdown">{mins}:{secs}</span>
              </div>
              <p className="text-fp-text text-xs mt-1">Show this to staff before it expires</p>
              <button
                onClick={generateQr}
                data-testid="coupon-qr-refresh"
                disabled={busy}
                className="mt-4 text-fp-gold text-xs font-semibold underline"
              >
                Refresh code
              </button>
            </>
          ) : (
            <>
              <p className="text-fp-text text-sm mb-4">Save this coupon to your wallet to reveal your QR.</p>
              <button
                onClick={claim}
                disabled={busy}
                data-testid="coupon-detail-claim"
                className="px-6 h-12 rounded-xl bg-fp-gold text-fp-navy font-bold text-sm fp-press"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save to Wallet'}
              </button>
            </>
          )}
        </div>

        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="terms" className="border-white/10">
            <AccordionTrigger data-testid="coupon-terms-trigger" className="text-sm">Terms &amp; Conditions</AccordionTrigger>
            <AccordionContent className="text-fp-text text-sm leading-relaxed">
              {coupon.terms_conditions || 'Standard terms apply. Cannot be combined with other offers.'}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="expiry" className="border-white/10">
            <AccordionTrigger className="text-sm">Validity</AccordionTrigger>
            <AccordionContent className="text-fp-text text-sm">
              Expires {new Date(coupon.expires_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
