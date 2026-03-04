// ============================================
// TYPES — Full system type definitions
// ============================================

export interface Club {
  id: string;
  name: string;
  address: string;
  phone: string;
  open_time: string;
  close_time: string;
}

export interface Hall {
  id: string;
  club_id: string;
  name: string;
}

export interface Table {
  id: string;
  hall_id: string;
  name: string;
  hall: string;
  image_url: string;
  price_per_hour: number;
  status: TableStatus;
}

export type TableStatus = "free" | "reserved" | "playing" | "paused";

export interface Slot {
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  table_id: string;
  table_name: string;
  hall: string;
  customer_name: string;
  phone: string;
  date: string;
  start_time: string;
  duration: number;
  price: number;
  status: BookingStatus;
  created_at: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Session {
  id: string;
  table_id: string;
  table_name: string;
  client: string;
  start_time: string;
  mode: SessionMode;
  duration: number;
  status: SessionStatus;
  pauses: { start: string; end: string | null }[];
  booking_id: string | null;
  created_at: string;
}

export type SessionMode = "open" | "1h" | "2h" | "3h" | "custom";
export type SessionStatus = "active" | "paused" | "finished";

export interface DashboardStats {
  playing: number;
  bookings_today: number;
  paused: number;
  revenue_today: number;
}

export interface CreateBookingRequest {
  table_id: string;
  date: string;
  start_time: string;
  duration: number;
  customer_name: string;
  phone: string;
}

export interface CreateSessionRequest {
  table_id: string;
  client: string;
  mode: SessionMode;
  duration: number;
  booking_id?: string;
}

export interface SSEEvent {
  type: "booking_created" | "booking_updated" | "session_started" | "session_updated" | "session_ended";
  data: Record<string, unknown>;
  timestamp: string;
}

export interface BookingState {
  date: string;
  duration: number;
  hallType: "main" | "vip";
  tableId: string | null;
  tableName: string | null;
  slotTime: string | null;
  pricePerHour: number;
}
