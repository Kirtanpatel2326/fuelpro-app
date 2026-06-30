import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Fuel, Loader2 } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 13.56c-.02-2.45 2.01-3.64 2.1-3.69-1.15-1.68-2.93-1.92-3.56-1.96-1.52-.15-2.97.9-3.75.9-.78 0-1.96-.88-3.21-.86-1.63.02-3.13.95-3.97 2.41-1.7 2.96-.44 7.33 1.22 9.72.8 1.15 1.74 2.43 3 2.39 1.2-.04 1.66-.78 3.12-.78 1.45 0 1.88.78 3.14.75 1.28-.02 2.1-.15 2.84-1.23.95-1.4 1.34-2.75 1.36-2.82-.03-.01-2.27-.87-2.29-4.83zM15.12 4.41c.64-.78 1.07-1.87.95-2.96-1.01.04-2.14.67-2.8 1.46-.58.68-1.09 1.81-.95 2.87 1.12.09 2.15-.59 2.8-1.37z" />
  </svg>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, socialLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('signin');

  const [signin, setSignin] = useState({ email: 'alex@fuelpro.com', password: 'test123' });
  const [signup, setSignup] = useState({ name: '', email: '', password: '', phone: '', birthday: '' });

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    const res = await socialLogin(provider, 'mock-token');
    setLoading(false);
    if (res.ok) {
      toast.success(`Welcome back via ${provider}!`);
      navigate(res.user.role === 'admin' ? '/admin' : '/', { replace: true });
    } else {
      toast.error(res.error);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(signin.email, signin.password);
    setLoading(false);
    if (res.ok) {
      toast.success('Welcome back!');
      navigate(res.user.role === 'admin' ? '/admin' : '/', { replace: true });
    } else {
      toast.error(res.error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(signup);
    setLoading(false);
    if (res.ok) {
      toast.success('Account created! 100 welcome points added 🎉');
      navigate('/', { replace: true });
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="theme-dark min-h-screen bg-fp-navy text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-fp-mid via-fp-navy to-fp-navy" />
      <div className="fp-grain absolute inset-0" />

      <div className="relative z-10 px-6 pt-12 pb-8 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-fp-gold flex items-center justify-center">
          <Fuel className="w-5 h-5 text-fp-navy" strokeWidth={3} />
        </div>
        <div>
          <h1 className="font-display text-2xl leading-none">FuelPro</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-fp-text mt-1">Rewards</p>
        </div>
      </div>

      <div className="relative z-10 px-6 flex-1">
        <h2 className="font-display text-3xl mb-1">Welcome.</h2>
        <p className="text-fp-text text-sm mb-8">Every gallon earns. Every visit rewards.</p>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-fp-mid border border-white/5 h-12 rounded-2xl p-1">
            <TabsTrigger value="signin" data-testid="auth-tab-signin" className="rounded-xl data-[state=active]:bg-fp-gold data-[state=active]:text-fp-navy data-[state=active]:font-bold">Sign In</TabsTrigger>
            <TabsTrigger value="signup" data-testid="auth-tab-signup" className="rounded-xl data-[state=active]:bg-fp-gold data-[state=active]:text-fp-navy data-[state=active]:font-bold">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="si-email" className="text-fp-text text-xs uppercase tracking-wider">Email</Label>
                <Input id="si-email" data-testid="signin-email" type="email" value={signin.email}
                  onChange={(e) => setSignin({ ...signin, email: e.target.value })}
                  className="mt-2 h-12 bg-fp-mid border-white/10 text-white placeholder:text-fp-text rounded-xl" required />
              </div>
              <div>
                <Label htmlFor="si-pass" className="text-fp-text text-xs uppercase tracking-wider">Password</Label>
                <Input id="si-pass" data-testid="signin-password" type="password" value={signin.password}
                  onChange={(e) => setSignin({ ...signin, password: e.target.value })}
                  className="mt-2 h-12 bg-fp-mid border-white/10 text-white placeholder:text-fp-text rounded-xl" required />
              </div>
              <Button data-testid="signin-submit" type="submit" disabled={loading}
                className="w-full h-14 bg-fp-gold text-fp-navy font-bold text-base rounded-2xl hover:bg-fp-gold/90 fp-press">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </Button>
              <p className="text-xs text-fp-text text-center pt-2">
                Demo accounts: <span className="text-fp-gold">alex@fuelpro.com / test123</span><br />
                Admin: <span className="text-fp-gold">admin@fuelpro.com / admin123</span>
              </p>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label className="text-fp-text text-xs uppercase tracking-wider">Full Name</Label>
                <Input data-testid="signup-name" value={signup.name}
                  onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                  className="mt-2 h-12 bg-fp-mid border-white/10 text-white rounded-xl" required />
              </div>
              <div>
                <Label className="text-fp-text text-xs uppercase tracking-wider">Email</Label>
                <Input data-testid="signup-email" type="email" value={signup.email}
                  onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                  className="mt-2 h-12 bg-fp-mid border-white/10 text-white rounded-xl" required />
              </div>
              <div>
                <Label className="text-fp-text text-xs uppercase tracking-wider">Phone (optional)</Label>
                <Input data-testid="signup-phone" value={signup.phone}
                  onChange={(e) => setSignup({ ...signup, phone: e.target.value })}
                  className="mt-2 h-12 bg-fp-mid border-white/10 text-white rounded-xl" />
              </div>
              <div>
                <Label className="text-fp-text text-xs uppercase tracking-wider">Birthday (optional)</Label>
                <Input data-testid="signup-birthday" type="date" value={signup.birthday}
                  onChange={(e) => setSignup({ ...signup, birthday: e.target.value })}
                  className="mt-2 h-12 bg-fp-mid border-white/10 text-white rounded-xl" />
              </div>
              <div>
                <Label className="text-fp-text text-xs uppercase tracking-wider">Password</Label>
                <Input data-testid="signup-password" type="password" value={signup.password}
                  onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                  className="mt-2 h-12 bg-fp-mid border-white/10 text-white rounded-xl" required minLength={6} />
              </div>
                <Button data-testid="signup-submit" type="submit" disabled={loading}
                  className="w-full h-14 bg-fp-gold text-fp-navy font-bold text-base rounded-2xl hover:bg-fp-gold/90 fp-press">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
            <span className="text-xs text-fp-text uppercase tracking-wider">Or</span>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleSocialLogin('Google')}
              className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 border-none rounded-2xl font-semibold text-base fp-press justify-center"
            >
              <GoogleIcon />
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleSocialLogin('Apple')}
              className="w-full h-14 bg-black hover:bg-gray-900 text-white border border-white/20 rounded-2xl font-semibold text-base fp-press justify-center"
            >
              <AppleIcon />
              Continue with Apple
            </Button>
          </div>
        </div>
    </div>
  );
}
