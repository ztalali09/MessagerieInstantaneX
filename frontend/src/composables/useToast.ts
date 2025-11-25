import { ref } from 'vue';

interface ToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface Toast extends ToastOptions {
  id: number;
}

const toasts = ref<Toast[]>([]);
let idCounter = 0;

export function useToast() {
  const show = (options: ToastOptions) => {
    const toast: Toast = {
      id: idCounter++,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration !== undefined ? options.duration : 3000
    };

    toasts.value.push(toast);

    if (toast.duration > 0) {
      setTimeout(() => {
        remove(toast.id);
      }, toast.duration);
    }
  };

  const remove = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (title: string, message?: string) => {
    show({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    show({ type: 'error', title, message, duration: 5000 });
  };

  const info = (title: string, message?: string) => {
    show({ type: 'info', title, message });
  };

  const warning = (title: string, message?: string) => {
    show({ type: 'warning', title, message });
  };

  return {
    toasts,
    show,
    remove,
    success,
    error,
    info,
    warning
  };
}


