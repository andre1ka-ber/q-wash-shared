// Hand-written to match q-wash-api/docs/openapi.yaml — see q-wash-shared/PLAN.md
// ("API types" decision) for why this isn't codegen.

export type UserRole = 'customer' | 'staff' | 'admin' | 'worker';

export interface User {
  id: string;
  phone_number: string;
  name: string | null;
  role: UserRole;
  washing_point_id: string | null;
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

export interface WashingPoint {
  id: string;
  owner_id: string | null;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  boxes_count: number;
  open_time: string;
  close_time: string;
  status: WashingPointStatus;
  // Both omitted from the JSON body entirely when unset (see API.md), not
  // sent as null/[] — treat as possibly absent, not just possibly null.
  description?: string;
  amenities?: string[];
}

export interface WashingPointUpdate {
  owner_id?: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
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

export interface Owner {
  id: string;
  name: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
}

export interface OwnerList {
  items: Owner[];
}

export interface OwnerCreate {
  name: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface OwnerUpdate {
  name?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

export type ConnectionRequestStatus = 'new' | 'approved' | 'rejected';

export interface ConnectionRequest {
  id: string;
  business_name: string;
  contact_name: string;
  contact_phone: string;
  address: string;
  boxes_count: number;
  note: string | null;
  status: ConnectionRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ConnectionRequestList {
  items: ConnectionRequest[];
}

export interface ConnectionRequestCreate {
  business_name: string;
  contact_name: string;
  contact_phone: string;
  address: string;
  boxes_count: number;
  note?: string;
}

export interface ConnectionRequestReview {
  status: 'approved' | 'rejected';
}

export type BoardItemStatus = 'queue' | 'waiting' | 'washing';

export interface BoardItem {
  id: string;
  status: BoardItemStatus;
  box_number: number;
  scheduled_start_at: string;
  scheduled_end_at: string;
  paused_at?: string;
  customer_phone_last4: string;
  car_name?: string;
}

export interface BoardItemList {
  items: BoardItem[];
}

// GET /washing-points/{id}/boxes/live — q-wash-worker's box-cards screen.
// status here is never 'ready'/'canceled' (see q-wash-api's
// queue.Handler.boxesLive: only queue/waiting/washing rows are joined in).
export interface LiveBoxBooking {
  id: string;
  status: BoardItemStatus;
  service_name?: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  paused_at?: string;
  customer_phone_last4: string;
  car_name?: string;
}

export interface LiveBox {
  number: number;
  label?: string;
  is_open: boolean;
  current?: LiveBoxBooking;
  next?: LiveBoxBooking;
}

export interface LiveBoxList {
  items: LiveBox[];
}

// GET /washing-points/{id}/board — q-wash-display's one summary screen.
// staff/admin only (not worker, unlike LiveBox above). No id field on
// DisplayBoardBooking — the board is a summary screen, it never links to
// a single booking.
export interface DisplayBoardBooking {
  status: 'washing';
  service_name?: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  paused_at?: string;
  customer_phone_last4: string;
  car_name?: string;
}

export interface DisplayBoardBox {
  number: number;
  label?: string;
  is_open: boolean;
  current?: DisplayBoardBooking;
}

export interface DisplayBoardWaitingItem {
  id: string;
  status: 'queue' | 'waiting';
  box_number: number;
  service_name?: string;
  scheduled_start_at: string;
  customer_phone_last4: string;
  car_name?: string;
}

export interface DisplayBoard {
  boxes_active: number;
  boxes_total: number;
  boxes: DisplayBoardBox[];
  waiting: DisplayBoardWaitingItem[];
}

// GET /washing-points/{id}/reports?period= — q-wash-cabinet's "Отчёты" tab.
// staff/admin only, scoped to the caller's own washing point.
export type ReportsPeriod = 'today' | 'week' | 'month';

export interface ReportsKPIs {
  revenue_cents: number;
  revenue_delta_pct: number | null;
  cars: number;
  cars_delta: number | null;
  avg_receipt_cents: number;
  avg_receipt_delta_pct: number | null;
  box_utilization_pct: number;
  box_utilization_delta_pp: number | null;
}

// One bucket of the revenue series: one per hour (period=today, always 24)
// or one per calendar day otherwise. timestamp is the bucket's start,
// RFC3339 in the business timezone — deliberately not pre-formatted, same
// convention QrCodePage's own scans_by_day already uses; format the
// hour/weekday/day-of-month label client-side from it.
export interface ReportsBar {
  timestamp: string;
  revenue_cents: number;
  highlighted: boolean;
}

export interface ReportsServiceRow {
  service_id: string;
  name: string;
  count: number;
  revenue_cents: number;
  share_pct: number;
}

export interface ReportsBoxRow {
  number: number;
  label: string;
  cars: number;
  revenue_cents: number;
  load_pct: number;
}

export interface Reports {
  period: ReportsPeriod;
  range_label: string;
  kpis: ReportsKPIs;
  bars: ReportsBar[];
  services: ReportsServiceRow[];
  boxes: ReportsBoxRow[];
}

export type BookingStatus = 'queue' | 'waiting' | 'washing' | 'ready' | 'canceled';

export interface Booking {
  id: string;
  status: BookingStatus;
  user_id: string;
  car_id: string;
  service_id: string;
  price_option_id: string;
  washing_point_id: string;
  box_number: number;
  scheduled_start_at: string;
  scheduled_end_at: string;
  notes: string | null;
  canceled_at: string | null;
  created_at: string;
  cars_ahead: number;
}

export interface BookingStatusUpdate {
  status: 'waiting' | 'washing' | 'ready';
}

export interface PriceOption {
  id: string;
  name: string;
  price_cents: number;
  is_default: boolean;
}

export interface PriceOptionInput {
  name: string;
  price_cents: number;
  is_default?: boolean;
}

export interface Service {
  id: string;
  washing_point_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  picture_url: string | null;
  is_active: boolean;
  price_options: PriceOption[];
}

export interface ServiceList {
  items: Service[];
}

export interface ServiceCreate {
  name: string;
  description?: string;
  duration_minutes: number;
  picture_url?: string;
  price_options: PriceOptionInput[];
}

export interface ServiceUpdate {
  name?: string;
  description?: string;
  duration_minutes?: number;
  picture_url?: string;
  is_active?: boolean;
}

export interface Box {
  id: string;
  number: number;
  label: string | null;
  is_open: boolean;
}

export interface BoxList {
  items: Box[];
}

export interface BoxCreate {
  label?: string;
}

export interface BoxUpdate {
  label?: string;
  is_open?: boolean;
}

export interface Photo {
  id: string;
  url: string;
  is_cover: boolean;
  sort_order: number;
}

export interface PhotoList {
  items: Photo[];
}

export interface PhotoUpdate {
  is_cover?: boolean;
  sort_order?: number;
}

export interface ScheduleRow {
  weekday: number;
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  break_start?: string | null;
  break_end?: string | null;
}

export interface ScheduleList {
  items: ScheduleRow[];
}

export type QrCodeStatus = 'free' | 'assigned' | 'disabled';

export interface QrCodeDayCount {
  date: string;
  count: number;
}

export interface QrCodeStats {
  scans_today: number;
  scans_7d: number;
  scans_by_day: QrCodeDayCount[];
  bookings_via_qr: number;
}

export interface QrCode {
  id: string;
  code: string;
  token: string;
  status: QrCodeStatus;
  batch_label: string;
  washing_point_id: string | null;
  washing_point_name: string | null;
  assigned_at: string | null;
  disabled_at: string | null;
  replacement_requested_at: string | null;
  created_at: string;
  stats?: QrCodeStats;
}

export interface QrCodeList {
  items: QrCode[];
}

export interface QrCodePoolStats {
  total: number;
  free: number;
  assigned: number;
  disabled: number;
}

export interface QrCodePoolList {
  items: QrCode[];
  stats: QrCodePoolStats;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
