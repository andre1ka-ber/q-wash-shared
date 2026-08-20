// Hand-written to match q-wash-api/docs/openapi.yaml — see q-wash-shared/PLAN.md
// ("API types" decision) for why this isn't codegen.

export type UserRole = 'customer' | 'staff' | 'admin' | 'worker';

export interface User {
  id: string;
  phone_number: string;
  name: string | null;
  role: UserRole;
  last_login_at: string | null;
}

export interface TokenPair {
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  user: User;
}

export type WashingPointStatus = 'active' | 'paused' | 'pending_review';

export interface WashingPointCreate {
  owner_id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  boxes_count?: number;
  open_time?: string;
  close_time?: string;
  status?: WashingPointStatus;
  description?: string;
  amenities?: string[];
}

export interface AdminWashingPoint {
  id: string;
  owner_id: string | null;
  owner_name: string | null;
  name: string;
  address: string;
  status: WashingPointStatus;
  boxes_count: number;
  services_count: number;
  created_at: string;
}

export interface AdminWashingPointList {
  items: AdminWashingPoint[];
}

export interface AdminStats {
  points_total: number;
  points_active: number;
  bookings_today: number;
  canceled_today: number;
  average_utilization: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
