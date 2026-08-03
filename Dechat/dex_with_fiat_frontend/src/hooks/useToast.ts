import { useSyncExternalStore, useCallback } from 'react';
<<<<<<< HEAD
import { AppToast, toastStore } from '@/lib/toastStore';

const EMPTY_ARRAY: AppToast[] = [];

=======
import { AppToast, AddToastOptions, ToastVariant, toastStore } from '@/lib/toastStore';

const EMPTY_ARRAY: AppToast[] = [];

function dispatchToastTelemetry(event: string, detail?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('toast_telemetry', { detail: { event, ...detail } }),
    );
  }
}

>>>>>>> emwulrd/main
export function useToast() {
  const getSnapshot = useCallback(() => toastStore.getSnapshot(), []);
  const toasts = useSyncExternalStore(
    (listener) => toastStore.subscribe(listener),
    getSnapshot,
    () => EMPTY_ARRAY,
  );

<<<<<<< HEAD
  return {
    toasts,
    addToast: toastStore.addToast.bind(toastStore),
    dismissToast: toastStore.dismissToast.bind(toastStore),
    clearToasts: toastStore.clearToasts.bind(toastStore),
=======
  const addToast = useCallback(
    (messageOrOptions: string | AddToastOptions, variantParam?: ToastVariant): string | null => {
      const id = toastStore.addToast(messageOrOptions, variantParam);
      const message =
        typeof messageOrOptions === 'string' ? messageOrOptions : messageOrOptions.message;
      const variant =
        typeof messageOrOptions === 'string' ? (variantParam ?? 'info') : (messageOrOptions.variant ?? messageOrOptions.severity ?? 'info');
      dispatchToastTelemetry('toast_added', { id, message, variant, deduped: id === null });
      return id;
    },
    [],
  );

  const dismissToast = useCallback(
    (id: string) => {
      toastStore.dismissToast(id);
      dispatchToastTelemetry('toast_dismissed', { id });
    },
    [],
  );

  const clearToasts = useCallback(
    () => {
      const count = toastStore.getSnapshot().length;
      toastStore.clearToasts();
      dispatchToastTelemetry('toasts_cleared', { count });
    },
    [],
  );

  return {
    toasts,
    addToast,
    dismissToast,
    clearToasts,
>>>>>>> emwulrd/main
  };
}
