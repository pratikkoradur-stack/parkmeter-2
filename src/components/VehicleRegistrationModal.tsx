import React, { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPlate?: string;
};

export const VehicleRegistrationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialPlate }) => {
  const [plate, setPlate] = useState(initialPlate || '');

  React.useEffect(() => {
    setPlate(initialPlate || '');
  }, [initialPlate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Register Vehicle</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Number Plate</label>
          <input value={plate} onChange={e => setPlate(e.target.value)} className="w-full border px-3 py-2 rounded" />
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
            <button onClick={() => { onSuccess && onSuccess(); onClose(); }} className="px-3 py-2 bg-blue-600 text-white rounded">Register</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleRegistrationModal;
