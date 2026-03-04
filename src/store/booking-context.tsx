// ============================================
// BOOKING STORE — Client-side state via URL + context
// ============================================

"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { BookingState } from "@/types";

const today = new Date().toISOString().split("T")[0];

const defaultState: BookingState = {
  date: today,
  duration: 1,
  hallType: "main",
  tableId: null,
  tableName: null,
  slotTime: null,
  pricePerHour: 3000,
};

interface BookingContextType {
  state: BookingState;
  setDate: (d: string) => void;
  setDuration: (d: number) => void;
  setHallType: (h: "main" | "vip") => void;
  selectTable: (id: string, name: string, price: number) => void;
  selectSlot: (time: string) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(defaultState);

  const setDate = (date: string) => setState((s) => ({ ...s, date, slotTime: null }));
  const setDuration = (duration: number) => setState((s) => ({ ...s, duration, slotTime: null }));
  const setHallType = (hallType: "main" | "vip") =>
    setState((s) => ({ ...s, hallType, tableId: null, tableName: null, slotTime: null }));
  const selectTable = (tableId: string, tableName: string, pricePerHour: number) =>
    setState((s) => ({ ...s, tableId, tableName, pricePerHour, slotTime: null }));
  const selectSlot = (slotTime: string) => setState((s) => ({ ...s, slotTime }));
  const reset = () => setState(defaultState);

  return (
    <BookingContext.Provider value={{ state, setDate, setDuration, setHallType, selectTable, selectSlot, reset }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

