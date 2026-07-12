import { addEventListener, removeAllEventListeners } from '../events';
import { invoke } from '../invoke';

type RegisterFn = (
  name: string,
  implementation: Record<string, unknown>,
) => void;

const APP_EVENTS = ['appUrlOpen', 'appStateChange', 'pause', 'resume'];

/**
 * Built-in bridge for the `@capacitor/app` plugin, backed by the crate's
 * `capacitor` commands and events. `appUrlOpen`, `appStateChange`, `pause`,
 * and `resume` are emitted from the Rust side (deep links, window focus).
 */
export function registerCoreAppPlugin(register: RegisterFn): void {
  register('App', {
    async exitApp(): Promise<void> {
      await invoke('app_exit');
    },
    async getInfo(): Promise<{
      name: string;
      id: string;
      build: string;
      version: string;
    }> {
      const [name, id, version] = await Promise.all([
        invoke<string>('app_get_name'),
        invoke<string>('app_get_identifier'),
        invoke<string>('app_get_version'),
      ]);
      return { name, id, build: version, version };
    },
    async getState(): Promise<{ isActive: boolean }> {
      return { isActive: document.hasFocus() };
    },
    async getLaunchUrl(): Promise<{ url: string } | undefined> {
      const url = await invoke<string | null>('app_get_launch_url');
      return url ? { url } : undefined;
    },
    addListener(eventName: string, callback: (data?: unknown) => void) {
      if (!APP_EVENTS.includes(eventName)) {
        // Unknown event: a no-op handle keeps the caller's contract.
        return { remove: async () => undefined };
      }
      return addEventListener('App', eventName, callback);
    },
    async removeAllListeners(): Promise<void> {
      removeAllEventListeners('App');
    },
  });
}
