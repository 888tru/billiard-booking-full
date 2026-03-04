"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useSSE() {
  const qc = useQueryClient();
  useEffect(() => {
    const es = new EventSource("/api/events");
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["tables"] });
    };
    es.addEventListener("booking_created", invalidate);
    es.addEventListener("booking_updated", invalidate);
    es.addEventListener("session_started", invalidate);
    es.addEventListener("session_updated", invalidate);
    es.addEventListener("session_ended", invalidate);
    return () => es.close();
  }, [qc]);
}

