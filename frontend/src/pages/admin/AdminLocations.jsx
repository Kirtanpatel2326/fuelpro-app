import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { MapPin, Fuel, Coffee, Droplets, Utensils, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '', address: '', city: '', state: '', zip_code: '', phone: '',
    latitude: 0, longitude: 0,
    has_carwash: false, has_coffee: true, has_subway: false, is_active: true
  });

  useEffect(() => {
    fetchLocations();
    const openAdd = () => setIsAdding(true);
    window.addEventListener('open-create-location', openAdd);
    return () => window.removeEventListener('open-create-location', openAdd);
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data.data);
    } catch (err) {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = async (locationId, grade, newPrice) => {
    // In a real app, you'd probably batch these or debounce.
    try {
      await api.put(`/locations/${locationId}/fuel-prices`, [
        { grade, price: parseFloat(newPrice) }
      ]);
      toast.success('Price updated');
      fetchLocations();
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/locations', {
        ...newLocation,
        latitude: parseFloat(newLocation.latitude) || 0,
        longitude: parseFloat(newLocation.longitude) || 0
      });
      toast.success('Location created successfully');
      setIsAdding(false);
      setNewLocation({
        name: '', address: '', city: '', state: '', zip_code: '', phone: '',
        latitude: 0, longitude: 0,
        has_carwash: false, has_coffee: true, has_subway: false, is_active: true
      });
      fetchLocations();
      window.dispatchEvent(new Event('locations-updated'));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create location');
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-gray-500">Loading locations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Locations & Features</h2>
          <p className="text-gray-500 text-sm">Manage your stores and their daily fuel prices.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-fp-navy text-white rounded-lg hover:bg-fp-navy/90 transition"
        >
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {locations.map(loc => (
          <div key={loc.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-fp-navy" /> {loc.name}
                </h3>
                <p className="text-gray-500 text-sm">{loc.address}, {loc.city}</p>
              </div>
              <div className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                {loc.is_active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>

            {/* Amenities */}
            <div className="flex gap-2 mb-6 border-y border-gray-100 py-3">
              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${loc.has_coffee ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-400 grayscale opacity-50'}`}>
                <Coffee className="w-3 h-3" /> Coffee
              </span>
              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${loc.has_carwash ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400 grayscale opacity-50'}`}>
                <Droplets className="w-3 h-3" /> Car Wash
              </span>
              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${loc.has_subway ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400 grayscale opacity-50'}`}>
                <Utensils className="w-3 h-3" /> Subway
              </span>
            </div>

            {/* Fuel Prices */}
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-gray-500" /> Current Fuel Prices
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {['regular', 'plus', 'premium', 'diesel'].map(grade => {
                  const priceDoc = loc.fuel_prices?.find(p => p.grade === grade);
                  const priceVal = priceDoc ? priceDoc.price.toFixed(2) : '0.00';
                  return (
                    <div key={grade} className="flex flex-col">
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-1">{grade}</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        defaultValue={priceVal}
                        onBlur={(e) => {
                          if (e.target.value !== priceVal) {
                            handlePriceChange(loc.id, grade, e.target.value);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-fp-gold focus:border-fp-gold outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Location Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Location</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Store Name</label>
                  <input required value={newLocation.name} onChange={e => setNewLocation({...newLocation, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. FuelPro Downtown" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Address</label>
                  <input required value={newLocation.address} onChange={e => setNewLocation({...newLocation, address: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input required value={newLocation.city} onChange={e => setNewLocation({...newLocation, city: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                  <input required value={newLocation.state} onChange={e => setNewLocation({...newLocation, state: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ZIP Code</label>
                  <input required value={newLocation.zip_code} onChange={e => setNewLocation({...newLocation, zip_code: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                  <input required value={newLocation.phone} onChange={e => setNewLocation({...newLocation, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Latitude</label>
                  <input required type="number" step="any" value={newLocation.latitude} onChange={e => setNewLocation({...newLocation, latitude: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Longitude</label>
                  <input required type="number" step="any" value={newLocation.longitude} onChange={e => setNewLocation({...newLocation, longitude: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-2">Amenities & Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newLocation.has_coffee} onChange={e => setNewLocation({...newLocation, has_coffee: e.target.checked})} className="rounded text-fp-gold focus:ring-fp-gold" /> Coffee
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newLocation.has_carwash} onChange={e => setNewLocation({...newLocation, has_carwash: e.target.checked})} className="rounded text-fp-gold focus:ring-fp-gold" /> Car Wash
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newLocation.has_subway} onChange={e => setNewLocation({...newLocation, has_subway: e.target.checked})} className="rounded text-fp-gold focus:ring-fp-gold" /> Subway
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer border-l pl-4 ml-2">
                    <input type="checkbox" checked={newLocation.is_active} onChange={e => setNewLocation({...newLocation, is_active: e.target.checked})} className="rounded text-fp-navy focus:ring-fp-navy" /> Active Store
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-fp-navy text-white rounded-lg hover:bg-fp-navy/90 font-bold">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
