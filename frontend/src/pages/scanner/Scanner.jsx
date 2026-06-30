import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, ScanLine, Loader2, ArrowLeft, Wifi, WifiOff, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function Scanner() {
  const [scanState, setScanState] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [redeemedCoupon, setRedeemedCoupon] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Registration and Location State
  const [locations, setLocations] = useState([]);
  const [registeredLocationId, setRegisteredLocationId] = useState(
    localStorage.getItem('terminalLocationId') || null
  );
  const [isOffline, setIsOffline] = useState(false);
  
  // Offline Sync State
  const [pendingSync, setPendingSync] = useState(() => {
    const saved = localStorage.getItem('pendingScans');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const syncPendingScans = useCallback(async () => {
    setIsSyncing(true);
    toast.info(`Syncing ${pendingSync.length} offline scans to server...`);
    
    try {
      await api.post('/scanner/sync', { scans: pendingSync });
      
      setPendingSync([]);
      localStorage.removeItem('pendingScans');
      toast.success("Offline scans synchronized successfully!");
    } catch (error) {
      toast.error("Failed to sync offline scans. Will retry later.");
    } finally {
      setIsSyncing(false);
    }
  }, [pendingSync]);

  // Sync logic when connection is restored
  useEffect(() => {
    if (!isOffline && pendingSync.length > 0 && !isSyncing) {
      syncPendingScans();
    }
  }, [isOffline, pendingSync.length, syncPendingScans, isSyncing]);

  useEffect(() => {
    // Fetch locations for registration
    api.get('/locations').then(res => setLocations(res.data.data)).catch(() => {});
  }, []);

  const handleScan = useCallback(async (decodedText) => {
    // Extract token (handle both raw string and JSON)
    let token = decodedText;
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.token) token = parsed.token;
    } catch (e) {}

    setScanState('processing');

    if (isOffline) {
      setTimeout(() => {
        const newPending = [...pendingSync, { token, timestamp: new Date().toISOString(), locationId: registeredLocationId }];
        setPendingSync(newPending);
        localStorage.setItem('pendingScans', JSON.stringify(newPending));
        setRedeemedCoupon({ title: "Saved for Offline Sync", type: "PENDING", discount_type: "NONE" });
        setScanState('success');
      }, 500); // Small delay for UX
    } else {
      try {
        const res = await api.post('/scanner/redeem', { 
          token, 
          location_id: registeredLocationId 
        });
        setRedeemedCoupon(res.data.coupon);
        setScanState('success');
      } catch (err) {
        setErrorMessage(err.response?.data?.detail || "Invalid or expired QR code.");
        setScanState('error');
      }
    }
  }, [isOffline, pendingSync, registeredLocationId]);

  useEffect(() => {
    // Prevent re-initialization if not idle
    if (scanState !== 'idle') return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText) => {
      scanner.pause();
      handleScan(decodedText);
      scanner.clear().catch(e => console.error(e));
    };

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner.", error));
    };
  }, [scanState, handleScan]);

  const resetScanner = () => {
    setScanState('idle');
    setRedeemedCoupon(null);
    setErrorMessage("");
  };

  const handleSimulateScan = () => {
    handleScan("simulated-token-1234");
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#0A1628] text-white overflow-hidden">
      {/* 60% Camera View */}
      <div className="w-full lg:w-[60%] relative flex items-center justify-center bg-black min-h-[50vh]">
        
        {scanState === 'idle' && (
          <div className="relative w-full max-w-lg p-2 rounded-3xl fp-scan-frame bg-black/50">
            <div id="reader" className="w-full overflow-hidden rounded-2xl opacity-90 shadow-2xl bg-black"></div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {scanState === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A1628] z-40 flex flex-col items-center justify-center"
            >
              <div className="relative">
                <ScanLine className="w-24 h-24 text-fp-gold" />
                <motion.div 
                  initial={{ top: 0 }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-fp-gold shadow-[0_0_20px_rgba(241,196,15,1)] z-50 pointer-events-none"
                />
              </div>
              <p className="mt-6 text-xl font-display text-fp-gold animate-pulse">Processing Claim...</p>
            </motion.div>
          )}

          {scanState === 'success' && redeemedCoupon && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#27AE60] z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <CheckCircle className="w-32 h-32 text-white mb-6 drop-shadow-lg" />
              <h2 className="text-5xl font-display font-bold text-white mb-4">Claim Redeemed!</h2>
              
              <div className="bg-black/20 rounded-3xl p-6 border border-white/20 max-w-md w-full mt-8 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold uppercase rounded-full tracking-wider">
                    {redeemedCoupon.type}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{redeemedCoupon.title}</h3>
                {redeemedCoupon.description && (
                  <p className="text-white/80 text-sm">{redeemedCoupon.description}</p>
                )}
              </div>

              <button 
                onClick={resetScanner}
                className="mt-12 px-8 py-4 bg-white text-[#27AE60] rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl flex items-center gap-3"
              >
                <ScanLine className="w-6 h-6" /> Scan Next Item
              </button>
            </motion.div>
          )}

          {scanState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#E8132A] z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <XCircle className="w-32 h-32 text-white mb-6 drop-shadow-lg" />
              <h2 className="text-5xl font-display font-bold text-white mb-4">Scan Failed</h2>
              <p className="text-xl text-white/90 max-w-md bg-black/20 p-4 rounded-xl border border-white/10">{errorMessage}</p>

              <button 
                onClick={resetScanner}
                className="mt-12 px-8 py-4 bg-white text-[#E8132A] rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl flex items-center gap-3"
              >
                <ArrowLeft className="w-6 h-6" /> Back to Scanner
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 40% Info Panel */}
      <div className="w-full lg:w-[40%] bg-gradient-to-b from-[#112240] to-[#0A1628] p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 relative z-10 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">POS Scanner</h2>
            <p className="text-gray-400 mb-4">Scan customer claim codes to redeem offers and rewards instantly.</p>
            
            <div className="mt-4">
              <label className="text-xs font-semibold text-fp-text uppercase tracking-wider mb-2 block">Terminal Location</label>
              <select
                value={registeredLocationId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    localStorage.setItem('terminalLocationId', val);
                    setRegisteredLocationId(val);
                    toast.success("Terminal location updated.");
                  } else {
                    localStorage.removeItem('terminalLocationId');
                    setRegisteredLocationId(null);
                  }
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fp-gold"
              >
                <option value="">-- Select Location --</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            {pendingSync.length > 0 && (
              <button
                onClick={syncPendingScans}
                disabled={isSyncing || isOffline}
                className="p-3 rounded-xl transition-colors flex items-center justify-center shadow-lg bg-fp-gold/20 text-fp-gold border border-fp-gold/30 hover:bg-fp-gold/30 disabled:opacity-50"
                title="Pending Offline Scans"
              >
                {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-fp-gold animate-pulse"></span>
                    {pendingSync.length} Pending
                  </div>
                )}
              </button>
            )}
            <button 
              onClick={() => setIsOffline(!isOffline)}
              className={`p-3 rounded-xl transition-colors flex items-center justify-center shadow-lg ${isOffline ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 text-fp-text border border-white/10'}`}
              title="Toggle Offline Mode"
            >
              {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {scanState === 'idle' ? (
            <div className="text-center">
              <ScanLine className="w-16 h-16 text-fp-gold/30 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-300">Ready to Scan</p>
              <p className="text-sm text-gray-500 mt-2">Point the camera at a customer's claim QR</p>
            </div>
          ) : (
             <div className="text-center opacity-50">
               <Ticket className="w-16 h-16 text-fp-text mx-auto mb-4" />
               <p className="text-lg">Processing Transaction</p>
             </div>
          )}
        </div>

        {scanState === 'idle' && (
          <div className="flex gap-4">
            <button
              onClick={handleSimulateScan}
              className="flex-1 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition font-medium text-sm border border-white/5"
            >
              Simulate Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
