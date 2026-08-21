"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endDateISO: string;
}

export default function CountdownTimer({ endDateISO }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    function calculate() {
      const end = new Date(endDateISO).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endDateISO]);

  if (!timeLeft) {
    return <span style={{ fontSize: "0.75rem", color: "var(--accent-orange)", fontWeight: 700 }}>* Ending Soon</span>;
  }

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.3rem",
      background: "rgba(249, 115, 22, 0.12)",
      border: "1px solid rgba(249, 115, 22, 0.3)",
      color: "var(--accent-orange)",
      fontSize: "0.72rem",
      fontWeight: 800,
      padding: "0.2rem 0.55rem",
      borderRadius: "4px",
      fontFamily: "var(--font-outfit)"
    }}>
      <span>[TIME]</span>
      <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
    </div>
  );
}
