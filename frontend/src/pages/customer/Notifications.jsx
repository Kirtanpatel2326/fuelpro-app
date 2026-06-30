import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bell, BellOff } from 'lucide-react';

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const r = await api.get('/notifications/inbox');
    setItems(r.data.data);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.post(`/notifications/inbox/${id}/read`);
    load();
  };

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in-up">
      <h1 className="font-display text-3xl mb-1">Inbox</h1>
      <p className="text-fp-text text-sm mb-6">Latest news and rewards.</p>

      {items.length === 0 && (
        <div className="text-center py-16 text-fp-text">
          <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No messages yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map(it => (
          <button
            key={it.id}
            data-testid={`inbox-item-${it.id}`}
            onClick={() => !it.is_read && markRead(it.id)}
            className={`w-full text-left p-4 rounded-2xl border fp-press ${
              it.is_read ? 'bg-fp-mid/50 border-white/5' : 'bg-fp-mid border-fp-gold/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${it.is_read ? 'bg-white/5' : 'bg-fp-gold/20'}`}>
                <Bell className={`w-4 h-4 ${it.is_read ? 'text-fp-text' : 'text-fp-gold'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{it.notification?.title}</p>
                  {!it.is_read && <span className="w-2 h-2 rounded-full bg-fp-red" />}
                </div>
                <p className="text-fp-text text-xs mt-1 leading-relaxed">{it.notification?.body}</p>
                <p className="text-fp-text text-[10px] mt-2 uppercase tracking-wider">
                  {new Date(it.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
