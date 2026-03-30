'use client';

import { v4 as uuidv4 } from 'uuid';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  timestamp: number;
}

type ToastListener = (toasts: Toast[]) => void;

const toasts: Toast[] = [];
const listeners: Set<ToastListener> = new Set();

function notifyListeners(): void {
  listeners.forEach((listener) => listener([...toasts]));
}

export const toastStore = {
  /**
   * Add a toast notification
   * @param message The message to display
   * @param variant The toast variant type (success, error, info, warning)
   * @returns The toast id for reference
   */
  addToast(message: string, variant: ToastVariant = 'info'): string {
    const toast: Toast = {
      id: uuidv4(),
      message,
      variant,
      timestamp: Date.now(),
    };
    toasts.push(toast);
    notifyListeners();
    return toast.id;
  },

  /**
   * Remove a toast by id
   */
  removeToast(id: string): void {
    const index = toasts.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      notifyListeners();
    }
  },

  /**
   * Subscribe to toast changes
   */
  subscribe(listener: ToastListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Get current toasts
   */
  getToasts(): Toast[] {
    return [...toasts];
  },

  /**
   * Clear all toasts
   */
  clearToasts(): void {
    toasts.length = 0;
    notifyListeners();
  },
};
