"use client";

import { useEffect, useState } from "react";

export function Ultradian({ phase }: { phase: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 60000)), 15000);
    return () => window.clearInterval(id);
  }, [phase]);
  const pct = Math.min(100, Math.round((elapsed / 90) * 100));
  return (
    <div className="ring" style={{ ["--pct" as string]: pct }} aria-label={`${elapsed} minutes into a 90-minute ultradian bout`}>
      <span>
        {elapsed}m
        <br />
        / 90
      </span>
    </div>
  );
}
