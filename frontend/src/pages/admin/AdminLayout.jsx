import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Ticket,
  Megaphone,
  Users,
  Gamepad2,
  BarChart3,
  Bell,
  ShieldAlert,
  Settings,
  LogOut,
  Plus,
  MapPin,
  Menu,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true, roles: ['admin', 'owner', 'regional_manager', 'store_manager'] },
  { label: 'Locations', path: '/admin/locations', icon: MapPin, roles: ['admin', 'owner', 'regional_manager'] },
  { label: 'Coupons', path: '/admin/coupons', icon: Ticket, roles: ['admin', 'owner', 'regional_manager', 'store_manager'] },
  { label: 'Promotions', path: '/admin/promotions', icon: Megaphone, roles: ['admin', 'owner', 'regional_manager'] },
  { label: 'Customers', path: '/admin/customers', icon: Users, roles: ['admin', 'owner', 'regional_manager', 'store_manager'] },
  { label: 'Gamification', path: '/admin/gamification', icon: Gamepad2, roles: ['admin', 'owner'] },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, roles: ['admin', 'owner', 'regional_manager'] },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell, roles: ['admin', 'owner', 'regional_manager', 'store_manager'] },
  { label: 'Fraud', path: '/admin/fraud', icon: ShieldAlert, roles: ['admin', 'owner'] },
  { label: 'Settings', path: '/admin/settings', icon: Settings, roles: ['admin', 'owner'] },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchLocs = () => api.get('/locations').then(res => setLocations(res.data.data)).catch(() => {});
    fetchLocs();
    window.addEventListener('locations-updated', fetchLocs);
    return () => window.removeEventListener('locations-updated', fetchLocs);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Filter nav items by role
  const userRole = user?.role || 'admin';
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  // Get current page title for top bar
  const currentNav = filteredNav.find(item => 
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );
  const pageTitle = currentNav ? currentNav.label : 'Dashboard';

  const displayRole = user?.role 
    ? user.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
    : 'Super Admin';

  return (
    <div className="flex h-screen bg-fp-gray font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-fp-navy text-white flex flex-col justify-between h-full shadow-xl z-50 transition-transform duration-300 md:static md:translate-x-0 flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo & Mobile Close */}
          <div className="p-6 flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded bg-fp-gold flex items-center justify-center font-bold text-fp-navy text-xs">F</div>
              <span className="text-xl font-bold tracking-tight">
                FuelPro<span className="text-fp-gold">Rewards</span>
              </span>
            </div>
            <button 
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-4 space-y-1">
            {filteredNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-white/10 text-white ring-1 ring-white/20 shadow-sm' 
                    : 'text-fp-text hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path)) ? 'text-fp-gold' : 'group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center px-2 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-fp-gold flex items-center justify-center text-fp-navy font-bold mr-3">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'FA'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.name || 'FuelPro Admin'}</p>
              <p className="text-[10px] uppercase tracking-wider text-fp-gold">{displayRole}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-fp-text hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10 w-full overflow-x-auto">
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-fp-navy"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-fp-navy hidden sm:block">{pageTitle}</h1>
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="bg-gray-100 border-none text-sm font-semibold text-gray-700 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <option value="ALL">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 ml-4">
            {/* Date Filters */}
            <div className="hidden lg:flex items-center bg-gray-50 p-1 rounded-full border border-gray-200">
              {['Today', 'Week', 'Month', 'Custom'].map((filter) => (
                <button 
                  key={filter}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filter === 'Custom' 
                      ? 'bg-white shadow text-fp-navy border border-gray-200' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button className="p-2 text-gray-400 hover:text-fp-navy transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-fp-red rounded-full ring-2 ring-white"></span>
            </button>

            <button 
              onClick={() => window.open('/scanner', '_blank')}
              className="hidden sm:flex items-center bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              <span className="hidden md:inline">Open POS Scanner</span>
            </button>

            <button 
              onClick={() => {
                const currentPath = location.pathname;
                if (currentPath === '/admin/locations') {
                  window.dispatchEvent(new Event('open-create-location'));
                } else if (currentPath === '/admin/coupons') {
                  window.dispatchEvent(new Event('open-create-coupon'));
                } else if (currentPath === '/admin/promotions') {
                  toast.info('Promotion creation not implemented in demo');
                } else {
                  toast.info('Navigate to Locations or Coupons to create an item.');
                }
              }}
              className="flex items-center bg-fp-red hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Create</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
