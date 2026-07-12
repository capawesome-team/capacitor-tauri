import { invokePlugin } from '../invoke';

const STORE_PATH = 'capacitor-preferences.json';

let ridPromise: Promise<number> | null = null;

// One store, loaded once and reused for the app's lifetime. Auto-save is on
// by default in tauri-plugin-store, matching Capacitor Preferences' "persist
// immediately" semantics.
const getRid = (): Promise<number> => {
  if (!ridPromise) {
    ridPromise = invokePlugin<number>('store', 'load', { path: STORE_PATH });
  }
  return ridPromise;
};

/**
 * Capacitor Preferences plugin implemented over `tauri-plugin-store`.
 * Capacitor stores string values; values round-trip as JSON strings.
 */
export const Preferences = {
  async get(options: { key: string }): Promise<{ value: string | null }> {
    const rid = await getRid();
    const [value, exists] = await invokePlugin<[string | null, boolean]>(
      'store',
      'get',
      { rid, key: options.key },
    );
    return { value: exists ? value : null };
  },
  async set(options: { key: string; value: string }): Promise<void> {
    const rid = await getRid();
    await invokePlugin('store', 'set', {
      rid,
      key: options.key,
      value: options.value,
    });
  },
  async remove(options: { key: string }): Promise<void> {
    const rid = await getRid();
    await invokePlugin('store', 'delete', { rid, key: options.key });
  },
  async keys(): Promise<{ keys: string[] }> {
    const rid = await getRid();
    const keys = await invokePlugin<string[]>('store', 'keys', { rid });
    return { keys };
  },
  async clear(): Promise<void> {
    const rid = await getRid();
    await invokePlugin('store', 'clear', { rid });
  },
};
