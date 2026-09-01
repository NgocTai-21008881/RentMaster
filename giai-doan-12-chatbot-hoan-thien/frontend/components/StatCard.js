"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function StatCard({ label, value, hint, tone = "indigo" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    const duration = 700;
    let frame;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(target * p));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const tones = {
    indigo: "from-indigo-500 to-violet-500",
    cyan: "from-cyan-500 to-blue-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500",
    slate: "from-slate-700 to-slate-500",
  };

  return (
    <motion.article whileHover={{ y: -4 }} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 bg-gradient-to-r ${tones[tone]}`} />
      <div className="p-5">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{display.toLocaleString("vi-VN")}</p>
        {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
      </div>
    </motion.article>
  );
}
