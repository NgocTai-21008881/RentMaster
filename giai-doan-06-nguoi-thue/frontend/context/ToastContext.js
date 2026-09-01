"use client";

import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function push(message, type = "success") {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3200);
  }

  return (
    <ToastContext.Provider value={{ push, success: (m) => push(m, "success"), error: (m) => push(m, "error") }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className={`pointer-events-auto rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${
                toast.type === "error" ? "bg-rose-600 text-white" : "bg-slate-900 text-white"
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
