import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle, CircleAlert, X } from "lucide-react";
import { ToastContext, type ToastInput } from "./toast-context";

type ToastType = "success" | "error";

type Toast = {
  id: number;
  type: ToastType;
  title: string;
  description: string;
  closing?: boolean;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const closeToast = useCallback((id: number) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, closing: true } : toast
      )
    );

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 220);
  }, []);

  const addToast = useCallback(
    (type: ToastType, input: ToastInput) => {
      const id = Date.now() + Math.random();
      const toast: Toast = { id, type, ...input };

      setToasts((current) => [...current, toast]);

      window.setTimeout(() => {
        closeToast(id);
      }, 5000);
    },
    [closeToast]
  );

  const value = useMemo(
    () => ({
      success: (toast: ToastInput) => addToast("success", toast),
      error: (toast: ToastInput) => addToast("error", toast),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => {
          const Icon = toast.type === "success" ? CheckCircle : CircleAlert;

          return (
            <div
              key={toast.id}
              className={`toast toast--${toast.type} ${
                toast.closing ? "toast--closing" : ""
              }`}
            >
              <div className="toast-icon">
                <Icon size={22} />
              </div>

              <div className="toast-content">
                <strong>{toast.title}</strong>
                <span>{toast.description}</span>
              </div>

              <button
                className="toast-close"
                type="button"
                aria-label="Fechar aviso"
                onClick={() => closeToast(toast.id)}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
