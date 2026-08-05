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
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => addToast("success", msg), [addToast]);
  const error = useCallback((msg: string) => addToast("error", msg), [addToast]);
  const info = useCallback((msg: string) => addToast("info", msg), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: { success, error, info } }}>
      {children}
      
      {/* Toast Render Area */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let bgColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
            let Icon = CheckCircle;

            if (t.type === "error") {
              bgColor = "bg-rose-500/10 border-rose-500/20 text-rose-300";
              Icon = AlertCircle;
            } else if (t.type === "info") {
              bgColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300";
              Icon = Info;
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColor} backdrop-blur-xl bg-[#060612]/80`}
                id={`toast-${t.id}`}
              >
                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm font-medium leading-relaxed">{t.message}</div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-0.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-current/60 hover:text-current"
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
