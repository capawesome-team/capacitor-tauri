// Bundles the platform shim (TypeScript) into a single IIFE and writes it to
// the crate as `bridge.js`, where it is baked in via `include_str!` and
// injected into every window by the `capacitor` Tauri plugin.
import { build } from 'esbuild';

await build({
  entryPoints: ['src/shim/index.ts'],
  outfile: 'crate/src/bridge.js',
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  legalComments: 'none',
});

console.log('Built crate/src/bridge.js');
