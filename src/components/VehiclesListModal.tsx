import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { isMongoApiConfigured, fetchVehicles } from '../lib/mongo';

type VehicleRecord = {
  id?: string;
  plate: string;
  owner?: string;
  model?: string;
  color?: string;
  type?: string;
  contact?: string;
  notes?: string;
  created_at?: string;
};

export const VehiclesListModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      if (isMongoApiConfigured()) {
        const data = await fetchVehicles(search || undefined);
        setVehicles(data || []);
      } else if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setVehicles(data as VehicleRecord[]);
      } else {
        const local = JSON.parse(localStorage.getItem('vehicles') || '[]');
        setVehicles(local.reverse());
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = vehicles.filter(v => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (v.plate || '').toLowerCase().includes(s) || (v.owner || '').toLowerCase().includes(s) || (v.model || '').toLowerCase().includes(s);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-4 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Vehicles Database</h3>
          <div>
            <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">Close</button>
          </div>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} className="border px-3 py-2 rounded flex-1" placeholder="Search by plate, owner, model" />
          <button onClick={load} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-left table-auto">
              <thead>
                <tr>
                  <th className="px-2 py-1">Plate</th>
                  <th className="px-2 py-1">Owner</th>
                  <th className="px-2 py-1">Model</th>
                  <th className="px-2 py-1">Color</th>
                  <th className="px-2 py-1">Type</th>
                  <th className="px-2 py-1">Contact</th>
                  <th className="px-2 py-1">Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1 font-mono">{v.plate}</td>
                    <td className="px-2 py-1">{v.owner}</td>
                    <td className="px-2 py-1">{v.model}</td>
                    <td className="px-2 py-1">{v.color}</td>
                    <td className="px-2 py-1">{v.type}</td>
                    <td className="px-2 py-1">{v.contact}</td>
                    <td className="px-2 py-1 text-sm text-gray-500">{v.created_at ? new Date(v.created_at).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="p-4 text-center text-gray-500">No records found</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesListModal;
