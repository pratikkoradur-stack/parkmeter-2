import React, { useState } from 'react';
import { isSupabaseConfigured, supabase, saveVehicleFallback } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // When a vehicle is successfully saved we return the inserted vehicle row
  onSuccess?: (vehicle?: any) => void;
  initialPlate?: string;
  initialOwner?: string;
  initialContact?: string;
};

export const VehicleRegistrationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialPlate, initialOwner, initialContact }) => {
  const [plate, setPlate] = useState(initialPlate || '');
  const [owner, setOwner] = useState(initialOwner || '');
  const [contact, setContact] = useState(initialContact || '');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('Car');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setPlate(initialPlate || '');
  }, [initialPlate]);

  React.useEffect(() => {
    setPlate(initialPlate || '');
    setOwner(initialOwner || '');
    setContact(initialContact || '');
  }, [initialPlate, initialOwner, initialContact]);

  if (!isOpen) return null;

  const supabaseConfigured = isSupabaseConfigured();

  const validate = () => {
    if (!plate || plate.trim().length < 3) return 'Number plate is required';
    if (!owner || owner.trim().length < 2) return 'Owner name is required';
    return null;
  };

  // Access authenticated user from context
  const { user } = useAuth();

  const save = async () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);

    // Demo/fallback record (keeps all input fields for local demo storage)
    const demoRecord = {
      plate: plate.trim().toUpperCase(),
      owner: owner.trim(),
      model: model.trim(),
      color: color.trim(),
      type,
      contact: contact.trim(),
      notes: notes.trim(),
      created_at: new Date().toISOString()
    };

    try {
      if (!supabaseConfigured) {
        // Demo mode: save locally and return the demo record
        const { data, error: fallbackError } = await saveVehicleFallback(demoRecord);
        if (fallbackError) throw fallbackError;
        onSuccess && onSuccess(data);
        onClose();
        return;
      }

      // Supabase is configured: require a signed-in user so we can attach the vehicle
      if (!user || !user.id) {
        setError('You must be signed in to register a vehicle.');
        return;
      }

      // Map local input to DB columns expected by the `vehicles` table
      const dbRecord: any = {
        user_id: user.id,
        license_plate: plate.trim().toUpperCase(),
        model: model.trim(),
        color: color.trim()
      };

      const { data, error: supabaseError } = await supabase!
        .from('vehicles')
        .insert([dbRecord])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // If successful: pass the inserted vehicle back to the caller
      onSuccess && onSuccess(data);
      onClose();

    } catch (err: any) {
      console.error('Vehicle save error:', err);
      // Map common network errors to a helpful message
      if (err instanceof TypeError && err.message && err.message.toLowerCase().includes('failed to fetch')) {
        setError('Network error: Unable to reach Supabase. Check your VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and that the Supabase project allows your app origin.');
      } else if (err?.message) {
        const msg = err.message.toLowerCase();
        if (msg.includes('license_plate') || (msg.includes('null value') && msg.includes('license_plate'))) {
          setError('Server error: Missing or invalid number plate. Please ensure the plate is provided.');
        } else if (msg.includes('user_id')) {
          setError('Server error: Unable to attach vehicle to your account. Please sign in and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to save vehicle');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Register Vehicle</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Number Plate</label>
            <input value={plate} onChange={e => setPlate(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Owner Name</label>
              <input value={owner} onChange={e => setOwner(e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <input value={contact} onChange={e => setContact(e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input value={model} onChange={e => setModel(e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input value={color} onChange={e => setColor(e.target.value)} className="w-full border px-3 py-2 rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option>Car</option>
              <option>Motorcycle</option>
              <option>Truck</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>

          {!supabaseConfigured && (
            <div className="text-sm text-yellow-700 mb-2">⚠️ Supabase not configured — using local demo storage; data will only be saved locally (not persisted to Supabase).</div>
          )}

          {supabaseConfigured && !user && (
            <div className="text-sm text-yellow-700 mb-2">⚠️ Please sign in to save vehicles to Supabase.</div>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
            <button onClick={save} disabled={loading || (supabaseConfigured && !user)} className="px-3 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : (supabaseConfigured ? (user ? 'Register Vehicle' : 'Sign in to Register') : 'Register (Demo)')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleRegistrationModal;
