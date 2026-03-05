// ============================================
// UNIFIED DATA STORE — Simulates Go backend + PostgreSQL
// Shared state for Admin Panel + Customer Booking
// ============================================

import { Table, Slot, Booking, Session, DashboardStats, SessionMode, TableStatus } from "@/types";

// ---- SSE Emitter ----
type Listener = (event: string, data: unknown) => void;
const listeners: Set<Listener> = new Set();
export function addSSEListener(fn: Listener) { listeners.add(fn); }
export function removeSSEListener(fn: Listener) { listeners.delete(fn); }
function emit(type: string, data: unknown) {
  listeners.forEach((fn) => fn(type, data));
}

// ---- Club ----
export const CLUB = {
  id: "club-1",
  name: "BILLIARD CLUB",
  address: "ул. Ауэзова 123, Алматы",
  phone: "+7 (777) 123-45-67",
  open_time: "12:00",
  close_time: "04:00",
};

// ---- Tables ----
const tablesMap = new Map<string, Table>([
  ["t1", { id: "t1", hall_id: "h1", name: "Стол 1", hall: "Основной зал", image_url: "/images/table.jpg", price_per_hour: 3000, status: "free" }],
  ["t2", { id: "t2", hall_id: "h1", name: "Стол 2", hall: "Основной зал", image_url: "/images/table.jpg", price_per_hour: 3000, status: "free" }],
  ["t3", { id: "t3", hall_id: "h1", name: "Стол 3", hall: "Основной зал", image_url: "/images/table.jpg", price_per_hour: 3000, status: "free" }],
  ["t4", { id: "t4", hall_id: "h1", name: "Стол 4", hall: "Основной зал", image_url: "/images/table.jpg", price_per_hour: 3000, status: "free" }],
  ["t5", { id: "t5", hall_id: "h1", name: "Стол 5", hall: "Основной зал", image_url: "/images/table.jpg", price_per_hour: 3000, status: "free" }],
  ["t6", { id: "t6", hall_id: "h1", name: "Стол 6", hall: "Основной зал", image_url: "/images/table.jpg", price_per_hour: 3500, status: "free" }],
  ["v1", { id: "v1", hall_id: "h2", name: "VIP 1", hall: "VIP зал", image_url: "/images/vip.jpg", price_per_hour: 5000, status: "free" }],
  ["v2", { id: "v2", hall_id: "h2", name: "VIP 2", hall: "VIP зал", image_url: "/images/vip.jpg", price_per_hour: 5000, status: "free" }],
  ["v3", { id: "v3", hall_id: "h2", name: "VIP 3", hall: "VIP зал", image_url: "/images/vip.jpg", price_per_hour: 6000, status: "free" }],
]);

export function getTables(): Table[] { return Array.from(tablesMap.values()); }
export function getTable(id: string): Table | undefined { return tablesMap.get(id); }

function setTableStatus(id: string, status: TableStatus) {
  const t = tablesMap.get(id);
  if (t) t.status = status;
}

// ---- Bookings ----
let bkCounter = 100;
const bookingsMap = new Map<string, Booking>();

export function getBookings(): Booking[] {
  return Array.from(bookingsMap.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
}
export function getBooking(id: string): Booking | undefined { return bookingsMap.get(id); }

export function createBooking(data: { table_id: string; date: string; start_time: string; duration: number; customer_name: string; phone: string }): { booking_id: string; status: string } {
  const table = tablesMap.get(data.table_id);
  const id = `BK-${++bkCounter}`;
  const booking: Booking = {
    id, table_id: data.table_id,
    table_name: table?.name || "?",
    hall: table?.hall || "?",
    customer_name: data.customer_name,
    phone: data.phone,
    date: data.date,
    start_time: data.start_time,
    duration: data.duration,
    price: (table?.price_per_hour || 3000) * data.duration,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  bookingsMap.set(id, booking);
  if (table && table.status === "free") setTableStatus(data.table_id, "reserved");
  emit("booking_created", booking);
  return { booking_id: id, status: "pending" };
}

export function updateBookingStatus(id: string, status: "confirmed" | "cancelled" | "completed"): Booking | undefined {
  const b = bookingsMap.get(id);
  if (!b) return undefined;
  b.status = status;
  if (status === "cancelled") {
    const hasOther = Array.from(bookingsMap.values()).some(x => x.table_id === b.table_id && x.id !== id && (x.status === "pending" || x.status === "confirmed"));
    if (!hasOther) setTableStatus(b.table_id, "free");
  }
  emit("booking_updated", b);
  return b;
}

export function confirmBooking(id: string): Booking | undefined {
  return updateBookingStatus(id, "confirmed");
}

// ---- Sessions ----
let sesCounter = 200;
const sessionsMap = new Map<string, Session>();

export function getSessions(): Session[] {
  return Array.from(sessionsMap.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
}
export function getActiveSessions(): Session[] {
  return getSessions().filter(s => s.status === "active" || s.status === "paused");
}

export function createSession(data: { table_id: string; client: string; mode: SessionMode; duration: number; booking_id?: string }): Session {
  const table = tablesMap.get(data.table_id);
  const id = `SS-${++sesCounter}`;
  const session: Session = {
    id, table_id: data.table_id,
    table_name: table?.name || "?",
    client: data.client,
    start_time: new Date().toISOString(),
    mode: data.mode,
    duration: data.duration,
    status: "active",
    pauses: [],
    booking_id: data.booking_id || null,
    created_at: new Date().toISOString(),
  };
  sessionsMap.set(id, session);
  setTableStatus(data.table_id, "playing");
  if (data.booking_id) updateBookingStatus(data.booking_id, "completed");
  emit("session_started", session);
  return session;
}

export function pauseSession(id: string): Session | undefined {
  const s = sessionsMap.get(id);
  if (!s || s.status !== "active") return undefined;
  s.status = "paused";
  s.pauses.push({ start: new Date().toISOString(), end: null });
  setTableStatus(s.table_id, "paused");
  emit("session_updated", s);
  return s;
}

export function resumeSession(id: string): Session | undefined {
  const s = sessionsMap.get(id);
  if (!s || s.status !== "paused") return undefined;
  const last = s.pauses[s.pauses.length - 1];
  if (last && !last.end) last.end = new Date().toISOString();
  s.status = "active";
  setTableStatus(s.table_id, "playing");
  emit("session_updated", s);
  return s;
}

export function finishSession(id: string): Session | undefined {
  const s = sessionsMap.get(id);
  if (!s || s.status === "finished") return undefined;
  if (s.status === "paused") {
    const last = s.pauses[s.pauses.length - 1];
    if (last && !last.end) last.end = new Date().toISOString();
  }
  s.status = "finished";
  setTableStatus(s.table_id, "free");
  emit("session_ended", s);
  return s;
}

export function getSessionElapsedMs(session: Session): number {
  const start = new Date(session.start_time).getTime();
  const now = session.status === "finished" ? new Date(session.created_at).getTime() : Date.now();
  let pausedMs = 0;
  for (const p of session.pauses) {
    const ps = new Date(p.start).getTime();
    const pe = p.end ? new Date(p.end).getTime() : Date.now();
    pausedMs += (pe - ps);
  }
  return Math.max(0, now - start - pausedMs);
}

export function calcSessionPrice(session: Session): number {
  const table = tablesMap.get(session.table_id);
  const rate = table?.price_per_hour || 3000;
  const hours = getSessionElapsedMs(session) / 3600000;
  return Math.round(hours * rate);
}

// ---- Slots ----
function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = [];
  let [h, m] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const closeMinutes = closeH < h ? (closeH + 24) * 60 + closeM : closeH * 60 + closeM;
  while (h * 60 + m < closeMinutes) {
    slots.push(`${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) { h++; m = 0; }
  }
  return slots;
}

export function getSlots(tableId: string, date: string): Slot[] {
  const allSlots = generateTimeSlots(CLUB.open_time, CLUB.close_time);

  // Collect booked times from bookings
  const bookedTimes = new Set<string>();
  for (const b of bookingsMap.values()) {
    if (b.table_id === tableId && b.date === date && (b.status === "pending" || b.status === "confirmed")) {
      const [sh, sm] = b.start_time.split(":").map(Number);
      for (let i = 0; i < b.duration * 2; i++) {
        const t = sh * 60 + sm + i * 30;
        bookedTimes.add(`${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
      }
    }
  }

  // Collect times blocked by active sessions
  for (const s of sessionsMap.values()) {
    if (s.table_id === tableId && (s.status === "active" || s.status === "paused")) {
      const startH = new Date(s.start_time).getHours();
      const startM = new Date(s.start_time).getMinutes();
      const durSlots = s.mode === "open" ? 16 : s.duration * 2;
      for (let i = 0; i < durSlots; i++) {
        const t = startH * 60 + startM + i * 30;
        bookedTimes.add(`${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
      }
    }
  }

  const now = new Date();
  const isToday = date === now.toISOString().split("T")[0];

  return allSlots.map((time) => {
    let past = false;
    if (isToday) {
      const [sh, sm] = time.split(":").map(Number);
      past = sh < now.getHours() || (sh === now.getHours() && sm <= now.getMinutes());
    }
    return { time, available: !bookedTimes.has(time) && !past };
  });
}

// ---- Dashboard ----
export function getDashboardStats(): DashboardStats {
  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = Array.from(bookingsMap.values()).filter(b => b.date === todayStr && (b.status === "pending" || b.status === "confirmed"));
  const active = Array.from(sessionsMap.values()).filter(s => s.status === "active");
  const paused = Array.from(sessionsMap.values()).filter(s => s.status === "paused");
  const finished = Array.from(sessionsMap.values()).filter(s => s.status === "finished");
  let revenue = 0;
  finished.forEach(s => { revenue += calcSessionPrice(s); });
  // Add confirmed booking prices
  Array.from(bookingsMap.values()).filter(b => b.date === todayStr && b.status === "completed").forEach(b => { revenue += b.price; });
  return {
    playing: active.length + paused.length,
    bookings_today: todayBookings.length,
    paused: paused.length,
    revenue_today: revenue,
  };
}

