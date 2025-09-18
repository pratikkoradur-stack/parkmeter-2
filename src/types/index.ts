export interface User {
  id: string;
  email: string;
  role: 'staff' | 'user';
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  member_since?: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  license_plate: string;
  make?: string;
  model?: string;
  color?: string;
  created_at: string;
}

export interface ParkingSession {
  id: string;
  user_id: string;
  vehicle_id: string;
  parking_spot?: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'completed' | 'cancelled';
  amount?: number;
}

export interface ParkingSpot {
  id: string;
  spot_number: string;
  is_occupied: boolean;
  vehicle_id?: string;
  updated_at: string;
}