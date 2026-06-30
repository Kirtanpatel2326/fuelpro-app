import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Mock interceptor for UI preview phase on Vercel
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!doctype html>')) {
      return getMockResponse(response.config.url);
    }
    return response;
  },
  (error) => {
    return getMockResponse(error.config?.url || '');
  }
);

function getMockResponse(url) {
  const data = (d) => ({ data: { data: d } });
  
  if (url.includes('/users/me/tier-progress')) return data({
    current: { name: 'Silver', multiplier: 1.2 },
    next: { name: 'Gold' },
    points_to_next: 1250,
    progress_pct: 65
  });
  
  if (url.includes('/coupons/wallet')) return data([
    { id: 1, coupon_id: '1', coupon: { title: 'Free Coffee with Fill-up', type: 'FREE_ITEM', image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80' } }
  ]);
  
  if (url.includes('/coupons')) return data([
    { id: '1', title: '5% Cashback on Premium Fuel', type: 'CASHBACK', discount_type: 'PERCENTAGE', discount_value: 5, description: 'Earn 5% cashback when you fill up with premium.', image_url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80' },
    { id: '2', title: 'Free Coffee with Fill-up', type: 'FREE_ITEM', discount_type: 'FREE_ITEM', discount_value: 0, description: 'Get a free regular coffee when you buy 8+ gallons.', image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80' },
    { id: '3', title: '20% Off Snacks', type: 'STORE', discount_type: 'PERCENTAGE', discount_value: 20, description: 'Save on all chips and candy.', image_url: 'https://images.unsplash.com/photo-1601599561096-f87c95fff1e9?w=500&q=80' },
  ]);
  
  if (url.includes('/notifications/inbox')) return data([
    { id: 1, is_read: false, created_at: new Date().toISOString(), notification: { title: 'Welcome to FuelPro', body: 'Start saving today!' } },
    { id: 2, is_read: true, created_at: new Date(Date.now() - 86400000).toISOString(), notification: { title: 'You reached Silver Tier!', body: 'Enjoy your 1.2x points multiplier.' } }
  ]);
  
  if (url.includes('/history')) return data([
    { id: 1, created_at: new Date().toISOString(), total: 45.20, points_earned: 450, station: { name: 'FuelPro Downtown' } },
    { id: 2, created_at: new Date(Date.now() - 86400000 * 3).toISOString(), total: 12.50, points_earned: 125, station: { name: 'FuelPro Westside' } }
  ]);
  
  if (url.includes('/rewards/tiers')) return data([
    { name: 'Bronze', points_threshold: 0, multiplier: 1.0 },
    { name: 'Silver', points_threshold: 1000, multiplier: 1.2 },
    { name: 'Gold', points_threshold: 5000, multiplier: 1.5 },
  ]);
  
  return data([]);
}

export function formatApiErrorDetail(detail) {
  if (detail == null) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(' ');
  }
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
}
