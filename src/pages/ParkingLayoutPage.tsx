import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react';
import { VehicleRegistrationModal } from '../components/VehicleRegistrationModal';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// State for booked list & total slots will be added in the component body below.

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
    // Start every slot as available with no vehicle or booking information.
    slots.push({
      id: `SLOT-${String(i + 1).padStart(3, '0')}`,
      status: 'available',
      vehicle: undefined,
      bookedBy: undefined
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
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(() => {
    try {
      const raw = localStorage.getItem('parkingSlots');
      if (raw) return JSON.parse(raw) as ParkingSlot[];
    } catch (err) {
      console.warn('Failed to load parking slots from localStorage', err);
    }
    return generateMockParkingData();
  });
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingPlate, setBookingPlate] = useState('');
  const [bookingContact, setBookingContact] = useState('');
  const [bookingDurationHours, setBookingDurationHours] = useState<number>(1);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  // Additional state for total slots and the list of booked vehicles
  const [totalSlots, setTotalSlots] = useState<number>(PARKING_ROWS * PARKING_COLS);
  const [bookedVehicles, setBookedVehicles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'booked'>('map');

  useEffect(() => {
    // Keep total slots in sync with layout size
    setTotalSlots(PARKING_ROWS * PARKING_COLS);
  }, []);

  useEffect(() => {
    // Fetch persisted bookings/vehicles from Supabase when configured
    (async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setBookedVehicles(data || []);
      } catch (err) {
        console.error('Failed to load bookings', err);
      }
    })();
  }, []);

  // If there are no bookings or vehicle records yet, show zero counts until a booking occurs.
  const hasBookings = parkingSlots.some(s => s.status !== 'available' || s.vehicle || s.bookedBy);
  const availableCount = hasBookings ? parkingSlots.filter(s => s.status === 'available').length : 0;
  const occupiedCount = hasBookings ? parkingSlots.filter(s => s.status === 'occupied').length : 0;
  const reservedCount = hasBookings ? parkingSlots.filter(s => s.status === 'reserved').length : 0;
  const maintenanceCount = hasBookings ? parkingSlots.filter(s => s.status === 'maintenance').length : 0;

  const persistSlots = (slots: ParkingSlot[]) => {
    try {
      localStorage.setItem('parkingSlots', JSON.stringify(slots));
    } catch (err) {
      console.warn('Failed to persist parking slots', err);
    }
  };

  const openBookingFor = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setBookingName('');
    setBookingPlate(slot.vehicle || '');
    setBookingContact('');
    setBookingDurationHours(1);
    setBookingError(null);
    setBookingOpen(true);
  };

  const saveBooking = () => {
    setBookingError(null);
    if (!selectedSlot) return;
    if (!bookingName || bookingName.trim().length < 2) {
      setBookingError('Name is required');
      return;
    }
    if (!bookingPlate || bookingPlate.trim().length < 2) {
      setBookingError('Vehicle plate is required');
      return;
    }

    // Open vehicle registration modal to register vehicle first,
    // then finalize reservation in `handleVehicleRegistered`.
    setBookingOpen(false);
    setVehicleModalOpen(true);
  };

  // When a vehicle is registered we expect the modal to return the saved vehicle record
  const handleVehicleRegistered = (vehicle?: any) => {
    if (!selectedSlot) return;

    const updated = parkingSlots.map(s => {
      if (s.id !== selectedSlot.id) return s;
      return {
        ...s,
        status: 'reserved',
        vehicle: vehicle ? vehicle.plate : bookingPlate.trim().toUpperCase(),
        bookedBy: bookingName.trim(),
      } as ParkingSlot;
    });

    setParkingSlots(updated);
    persistSlots(updated);

    const newSelected = updated.find(s => s.id === selectedSlot.id) || null;
    setSelectedSlot(newSelected);
    setVehicleModalOpen(false);

    // Save booking into Supabase bookings table for persistence and list view
    (async () => {
      try {
        if (!isSupabaseConfigured()) return;

        const bookingRecord = {
          slot_id: selectedSlot.id,
          plate: vehicle ? vehicle.plate : bookingPlate.trim().toUpperCase(),
          owner: vehicle ? vehicle.owner : bookingName.trim(),
          contact: bookingContact.trim() || null,
          duration_hours: bookingDurationHours,
          status: 'reserved',
          created_at: new Date().toISOString()
        };

        const { data: insertData, error: insertErr } = await supabase.from('bookings').insert([bookingRecord]).select().single();
        if (insertErr) throw insertErr;
        // Re-fetch bookings list
        const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        setBookedVehicles(data || []);
      } catch (err) {
        console.error('Failed to persist booking', err);
      }
    })();
  };

  const cancelReservation = (slotId: string) => {
    const ok = window.confirm('Cancel reservation for this slot?');
    if (!ok) return;

    const updated = parkingSlots.map(s => {
      if (s.id !== slotId) return s;
      return {
        ...s,
        status: 'available',
        vehicle: undefined,
        bookedBy: undefined,
      } as ParkingSlot;
    });

    setParkingSlots(updated);
    persistSlots(updated);

    // Remove the booking record from Supabase (mark cancelled)
    (async () => {
      try {
        if (!isSupabaseConfigured()) return;
        // For simplicity, mark the booking as 'cancelled' where slot_id matches
        await supabase.from('bookings').update({ status: 'cancelled' }).eq('slot_id', slotId);
        // Re-fetch bookings list
        const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        setBookedVehicles(data || []);
      } catch (err) {
        console.error('Failed to update booking', err);
      }
    })();

    if (selectedSlot && selectedSlot.id === slotId) {
      setSelectedSlot(updated.find(s => s.id === slotId) || null);
    }
  };

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
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalSlots}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <span>📦</span> Total Slots
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

          {/* Tab switcher for Map / Booked Vehicles */}
          <div>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex gap-2 justify-center">
                  <button onClick={() => setActiveTab('map')} className={`px-3 py-1 rounded ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Map</button>
                  <button onClick={() => setActiveTab('booked')} className={`px-3 py-1 rounded ${activeTab === 'booked' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Booked</button>
                </div>
              </CardContent>
            </Card>
          </div>
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

                {activeTab === 'map' ? (
                  <>
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
                  </>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Booked Vehicles</h3>
                    {bookedVehicles.length === 0 ? (
                      <p className="text-sm text-gray-500">No bookings found.</p>
                    ) : (
                      <div className="space-y-3">
                        {bookedVehicles.map(b => (
                          <div key={b.id} className="p-3 border rounded flex items-center justify-between">
                            <div>
                              <div className="font-mono font-bold">{b.plate}</div>
                              <div className="text-sm text-gray-600">{b.owner} • Slot {b.slot_id}</div>
                            </div>
                            <div className="text-sm text-gray-500">{new Date(b.created_at).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                                      <Button
                                        variant="primary"
                                        className="w-full mt-6"
                                        onClick={() => openBookingFor(selectedSlot)}
                                      >
                                        Book Now
                                      </Button>
                                    )}

                                    {selectedSlot.status === 'reserved' && (
                                      <button
                                        onClick={() => cancelReservation(selectedSlot.id)}
                                        className="w-full mt-4 px-3 py-2 bg-red-600 text-white rounded"
                                      >
                                        Cancel Reservation
                                      </button>
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
          {bookingOpen && selectedSlot && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Book Slot {selectedSlot.id}</h3>
                  <button onClick={() => setBookingOpen(false)} className="text-gray-500">Close</button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Your Name</label>
                    <input value={bookingName} onChange={e => setBookingName(e.target.value)} className="w-full border px-3 py-2 rounded" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Plate</label>
                    <input value={bookingPlate} onChange={e => setBookingPlate(e.target.value)} className="w-full border px-3 py-2 rounded" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact (optional)</label>
                    <input value={bookingContact} onChange={e => setBookingContact(e.target.value)} className="w-full border px-3 py-2 rounded" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
                    <input type="number" min={1} value={bookingDurationHours} onChange={e => setBookingDurationHours(Number(e.target.value))} className="w-full border px-3 py-2 rounded" />
                  </div>

                  {bookingError && <div className="text-sm text-red-600">{bookingError}</div>}

                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setBookingOpen(false)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                    <button onClick={saveBooking} className="px-3 py-2 bg-blue-600 text-white rounded">Confirm Booking</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <VehicleRegistrationModal
            isOpen={vehicleModalOpen}
            onClose={() => setVehicleModalOpen(false)}
            onSuccess={handleVehicleRegistered}
            initialPlate={bookingPlate}
            initialOwner={bookingName}
            initialContact={bookingContact}
          />
        </div>
      </div>
    </div>
  );
};

export default ParkingLayoutPage;
