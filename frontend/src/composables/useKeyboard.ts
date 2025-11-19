import { onMounted, onUnmounted } from 'vue';

type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: KeyHandler;
  description?: string;
}

export function useKeyboard() {
  const shortcuts = new Map<string, ShortcutConfig>();

  const getShortcutKey = (config: ShortcutConfig): string => {
    const parts = [];
    if (config.ctrl) parts.push('ctrl');
    if (config.shift) parts.push('shift');
    if (config.alt) parts.push('alt');
    parts.push(config.key.toLowerCase());
    return parts.join('+');
  };

  const register = (config: ShortcutConfig) => {
    const key = getShortcutKey(config);
    shortcuts.set(key, config);
  };

  const unregister = (config: ShortcutConfig) => {
    const key = getShortcutKey(config);
    shortcuts.delete(key);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const parts = [];
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    parts.push(event.key.toLowerCase());
    
    const key = parts.join('+');
    const shortcut = shortcuts.get(key);

    if (shortcut) {
      event.preventDefault();
      shortcut.handler(event);
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    register,
    unregister,
    shortcuts
  };
}


