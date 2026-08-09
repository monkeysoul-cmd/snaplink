import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextProps {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem("linkcut_notifications_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem("linkcut_notifications_enabled", String(enabled));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    if (!notificationsEnabled) return;
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [notificationsEnabled, removeToast]);

  const success = useCallback((msg: string) => addToast("success", msg), [addToast]);
  const error = useCallback((msg: string) => addToast("error", msg), [addToast]);
  const info = useCallback((msg: string) => addToast("info", msg), [addToast]);

  return (
    <ToastContext.Provider value={{ notificationsEnabled, setNotificationsEnabled, toast: { success, error, info } }}>
      {children}
      
      {/* Toast Render Area */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let containerStyles = "bg-emerald-50/95 dark:bg-[#071d18]/95 border-emerald-300 dark:border-emerald-700/60 shadow-emerald-950/5 dark:shadow-black/40";
            let Icon = CheckCircle;
            let iconColor = "text-emerald-600 dark:text-emerald-400";

            if (t.type === "error") {
              containerStyles = "bg-rose-50/95 dark:bg-[#200b13]/95 border-rose-300 dark:border-rose-700/60 shadow-rose-950/5 dark:shadow-black/40";
              Icon = AlertCircle;
              iconColor = "text-rose-600 dark:text-rose-400";
            } else if (t.type === "info") {
              containerStyles = "bg-sky-50/95 dark:bg-[#0a1829]/95 border-sky-300 dark:border-sky-700/60 shadow-sky-950/5 dark:shadow-black/40";
              Icon = Info;
              iconColor = "text-sky-600 dark:text-sky-400";
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-colors ${containerStyles}`}
                id={`toast-${t.id}`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 text-sm font-semibold leading-relaxed text-zinc-900 dark:text-zinc-100">{t.message}</div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
