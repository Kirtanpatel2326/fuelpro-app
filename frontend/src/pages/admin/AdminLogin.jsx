import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@fuelpro.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.ok) {
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      }
    } catch (err) {
      toast.error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fp-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-fp-gold"></div>
        
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-fp-navy">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-500">Sign in to manage locations and rewards.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-fp-navy focus:border-fp-navy outline-none transition-all"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-fp-navy focus:border-fp-navy outline-none transition-all"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-fp-navy hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
          >
            {isLoading ? 'Authenticating...' : 'Login as Admin'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Demo Mode: Just click login to proceed.</p>
        </div>
      </div>
    </div>
  );
}
