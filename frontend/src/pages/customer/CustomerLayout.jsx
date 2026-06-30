import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Ticket, Map, User, Bot } from 'lucide-react';

const TABS = [
  { to: '/',              icon: Home,   label: 'Home',     testid: 'tab-home' },
  { to: '/finder',        icon: Map,    label: 'Finder',   testid: 'tab-finder' },
  { to: '/coupons',       icon: Ticket, label: 'Coupons',  testid: 'tab-coupons' },
  { to: '/copilot',       icon: Bot,    label: 'Copilot',  testid: 'tab-copilot' },
  { to: '/profile',       icon: User,   label: 'Profile',  testid: 'tab-profile' },
];

export default function CustomerLayout() {
  const { pathname } = useLocation();
  const hideTabs = pathname.startsWith('/coupons/');

  return (
    <div className="theme-dark min-h-screen bg-fp-navy text-white relative" style={{ paddingBottom: hideTabs ? 0 : 88 }}>
      <main className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen relative shadow-2xl bg-[#0A1628]">
        <Outlet />
      </main>

      {!hideTabs && (
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-fp-mid/95 backdrop-blur-xl border-t border-white/5">
          <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto grid grid-cols-5 px-2 pt-2 pb-4">
            {TABS.map(({ to, icon: Icon, label, testid }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                data-testid={testid}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2 fp-press ${isActive ? 'text-fp-gold' : 'text-fp-text'}`
                }
              >
                <Icon className="w-5 h-5" strokeWidth={2.2} />
                <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
