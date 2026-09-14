// src/context/ToastContext.js
import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

// Custom hook for easy access
export const useToast = () => useContext(ToastContext);
