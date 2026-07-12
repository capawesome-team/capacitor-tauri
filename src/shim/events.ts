import { invoke } from './invoke';

// Receives core-plugin events pushed from the Rust side over the
// `capacitor://event` Tauri event channel and dispatches them to listeners
// registered via `addListener`. Uses the same de-facto-stable
// `__TAURI_INTERNALS__` surface as `invoke`.

interface TauriInternals {
  transformCallback(callback: (event: unknown) => void, once?: boolean): number;
}

const EVENT_CHANNEL = 'capacitor://event';

interface CapacitorEvent {
  plugin: string;
  event: string;
  data?: unknown;
}

type Listener = (data?: unknown) => void;

const listeners = new Map<string, Set<Listener>>();
const key = (plugin: string, event: string): string => `${plugin}:${event}`;

let started = false;

function ensureStarted(): void {
  if (started) {
    return;
  }
  started = true;
  const internals = (
    window as unknown as { __TAURI_INTERNALS__?: TauriInternals }
  ).__TAURI_INTERNALS__;
  if (!internals) {
    return;
  }
  const handler = internals.transformCallback((raw: unknown) => {
    const payload = (raw as { payload?: CapacitorEvent }).payload;
    if (!payload) {
      return;
    }
    const set = listeners.get(key(payload.plugin, payload.event));
    if (set) {
      for (const listener of set) {
        listener(payload.data);
      }
    }
  });
  void invoke('plugin:event|listen', {
    event: EVENT_CHANNEL,
    target: { kind: 'Any' },
    handler,
  });
}

export interface ListenerHandle {
  remove: () => Promise<void>;
}

export function addEventListener(
  plugin: string,
  event: string,
  callback: Listener,
): ListenerHandle {
  ensureStarted();
  const set = listeners.get(key(plugin, event)) ?? new Set<Listener>();
  set.add(callback);
  listeners.set(key(plugin, event), set);
  return {
    remove: async () => {
      set.delete(callback);
    },
  };
}

export function removeAllEventListeners(plugin: string): void {
  for (const registryKey of [...listeners.keys()]) {
    if (registryKey.startsWith(`${plugin}:`)) {
      listeners.delete(registryKey);
    }
  }
}
