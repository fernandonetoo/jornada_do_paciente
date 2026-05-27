import { createContext } from "react";

export type ToastInput = {
  title: string;
  description: string;
};

export type ToastContextValue = {
  success: (toast: ToastInput) => void;
  error: (toast: ToastInput) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
