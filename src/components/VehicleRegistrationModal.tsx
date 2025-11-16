import React, { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPlate?: string;
};

export const VehicleRegistrationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialPlate }) => {
  const [plate, setPlate] = useState(initialPlate || '');
  const [owner, setOwner] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('Car');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setPlate(initialPlate || '');
  }, [initialPlate]);

  if (!isOpen) return null;

  const validate = () => {
    if (!plate || plate.trim().length < 3) return 'Number plate is required';
    if (!owner || owner.trim().length < 2) return 'Owner name is required';
    return null;
  };

  const save = async () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    const record = {
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
      // This sends the data to your new EC2 server
      const response = await fetch('http://15.206.88.25:5000/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        // Get the error message from your API if it fails
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save vehicle');
      }

      // This part is the same as your old code
      onSuccess && onSuccess();
      onClose();

    } catch (err: any) {
      setError(err?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }

      onSuccess && onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save vehicle');
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

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
            <button onClick={save} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Register Vehicle'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleRegistrationModal;
