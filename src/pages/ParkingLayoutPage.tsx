import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ParkingSlot = {
  id: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  vehicle?: string;
  bookedBy?: string;
};

const PARKING_ROWS = 5;
const PARKING_COLS = 8;

const generateMockParkingData = (): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  for (let i = 0; i < PARKING_ROWS * PARKING_COLS; i++) {
    const statuses: Array<'available' | 'occupied' | 'reserved' | 'maintenance'> = ['available', 'occupied', 'reserved', 'maintenance'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    slots.push({
      id: `SLOT-${String(i + 1).padStart(3, '0')}`,
      status: randomStatus,
      vehicle: randomStatus === 'occupied' ? `KA-01-AB-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}` : undefined,
      bookedBy: randomStatus === 'reserved' ? `User ${i % 5 + 1}` : undefined
    });
  }
  return slots;
};

const getSlotColor = (status: string): string => {
  switch (status) {
    case 'available':
      return 'bg-green-500 hover:bg-green-600';
    case 'occupied':
      return 'bg-red-500 hover:bg-red-600';
    case 'reserved':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'maintenance':
      return 'bg-gray-400 hover:bg-gray-500';
    default:
      return 'bg-gray-300';
  }
};

const getSlotLabel = (status: string): string => {
  switch (status) {
    case 'available':
      return '🟢';
    case 'occupied':
      return '🔴';
    case 'reserved':
      return '🟡';
    case 'maintenance':
      return '⚪';
    default:
      return '◯';
  }
};

export const ParkingLayoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [parkingSlots] = useState<ParkingSlot[]>(generateMockParkingData());
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const availableCount = parkingSlots.filter(s => s.status === 'available').length;
  const occupiedCount = parkingSlots.filter(s => s.status === 'occupied').length;
  const reservedCount = parkingSlots.filter(s => s.status === 'reserved').length;
  const maintenanceCount = parkingSlots.filter(s => s.status === 'maintenance').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Parking Layout" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{availableCount}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <span>🟢</span> Available
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">{occupiedCount}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <span>🔴</span> Occupied
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{reservedCount}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <span>🟡</span> Reserved
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gray-600 mb-1">{maintenanceCount}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <span>⚪</span> Maintenance
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Parking Map Section */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin size={24} className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Parking Area Map</h2>
                </div>
                
                {/* Parking Grid */}
                <div className="bg-gray-100 p-6 rounded-lg overflow-auto">
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${PARKING_COLS}, minmax(60px, 1fr))` }}>
                    {parkingSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                          aspect-square rounded-lg font-bold text-white text-sm
                          flex items-center justify-center cursor-pointer
                          transition-all duration-200 transform hover:scale-105
                          shadow-md hover:shadow-lg
                          ${getSlotColor(slot.status)}
                        `}
                        title={`${slot.id} - ${slot.status}`}
                      >
                        <span className="text-lg">{getSlotLabel(slot.status)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Reserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span>Maintenance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Slot Details</h3>
                
                {selectedSlot ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Slot ID</label>
                      <div className="text-lg font-mono font-bold text-gray-900 mt-1">{selectedSlot.id}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold text-white
                        ${selectedSlot.status === 'available' && 'bg-green-500'}
                        ${selectedSlot.status === 'occupied' && 'bg-red-500'}
                        ${selectedSlot.status === 'reserved' && 'bg-yellow-500'}
                        ${selectedSlot.status === 'maintenance' && 'bg-gray-400'}
                      `}>
                        {selectedSlot.status.charAt(0).toUpperCase() + selectedSlot.status.slice(1)}
                      </div>
                    </div>

                    {selectedSlot.vehicle && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Vehicle Plate</label>
                        <div className="text-lg font-mono font-bold text-gray-900 mt-1">{selectedSlot.vehicle}</div>
                      </div>
                    )}

                    {selectedSlot.bookedBy && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Booked By</label>
                        <div className="text-gray-900 mt-1">{selectedSlot.bookedBy}</div>
                      </div>
                    )}

                    {selectedSlot.status === 'available' && (
                      <Button variant="primary" className="w-full mt-6">
                        Book Now
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <AlertCircle size={40} className="mb-2 opacity-50" />
                    <p className="text-sm">Click on a parking slot to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingLayoutPage;
