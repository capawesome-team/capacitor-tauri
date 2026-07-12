import { strict as assert } from 'assert';

// Drives the packaged app: the bridge injects the platform, the built-in App
// plugin resolves, a Tier-2 plugin (Preferences → tauri-plugin-store) round-
// trips natively, and a Tier-1 plugin (Device) falls back to its web impl.

const text = async testId => {
  const element = await $(`[data-testid="${testId}"]`);
  await element.waitUntil(async () => (await element.getText()) !== '?', {
    timeout: 20000,
  });
  return element.getText();
};

describe('Capacitor Tauri bridge', () => {
  it('injects the platform and round-trips plugins', async () => {
    assert.equal(await text('status'), 'ready');
    assert.equal(await text('platform'), 'tauri');
    assert.equal(await text('native'), 'true');
    assert.equal(
      await text('app-info'),
      'Capacitor Tauri Example (io.capawesome.tauriexample)',
    );
    // Tier 2: Preferences via tauri-plugin-store.
    assert.equal(await text('preferences'), 'hello-tauri');
    // Tier 1: Device web implementation via automatic fallback.
    assert.equal(await text('device'), 'web');
  });
});
