import { useSyncExternalStore } from 'react';
import { toastStore } from '@/lib/toastStore';

const EMPTY_ARRAY = [];

export function useToast() {
  const toasts = useSyncExternalStore(
    (listener) => toastStore.subscribe(listener),
    () => toastStore.getSnapshot(),
    () => EMPTY_ARRAY,
  );

  return {
    toasts,
    addToast: toastStore.addToast.bind(toastStore),
    dismissToast: toastStore.dismissToast.bind(toastStore),
    clearToasts: toastStore.clearToasts.bind(toastStore),
  };
}
