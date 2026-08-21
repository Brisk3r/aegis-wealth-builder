"use client";

import { useEffect, useState } from "react";

export interface TelemetryState {
  version: string;
  systemStatus: string;
  activeCurrency: string;
  uptimeSeconds: number;
}

export function useAegisTelemetry(): TelemetryState {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    version: "25.0.0-APEX",
    systemStatus: "Operational",
    activeCurrency: "USD",
    uptimeSeconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({ ...prev, uptimeSeconds: prev.uptimeSeconds + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return telemetry;
}
