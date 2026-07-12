import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';

const set = (testId: string, value: string): void => {
  const element = document.querySelector(`[data-testid="${testId}"]`);
  if (element) {
    element.textContent = value;
  }
};

const bootstrap = async (): Promise<void> => {
  set('platform', Capacitor.getPlatform());
  set('native', String(Capacitor.isNativePlatform()));

  const info = await App.getInfo();
  set('app-info', `${info.name} (${info.id})`);

  // Tier 2: Preferences → tauri-plugin-store (native round-trip).
  await Preferences.set({ key: 'greeting', value: 'hello-tauri' });
  const { value } = await Preferences.get({ key: 'greeting' });
  set('preferences', value ?? '(null)');

  // Tier 1: Device has no Tauri implementation, so its web implementation
  // runs automatically via the platform's fallback.
  const deviceInfo = await Device.getInfo();
  set('device', deviceInfo.platform);

  set('status', 'ready');
};

void bootstrap().catch(error =>
  set('status', `error: ${(error as Error).message}`),
);
