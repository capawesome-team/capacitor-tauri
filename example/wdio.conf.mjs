import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// Drives the built Tauri app through tauri-driver + WebDriver. tauri-driver
// supports Linux and Windows only (not macOS), so the e2e job runs on those.

const binaryName = 'capacitor-tauri-example';
const releaseDir = join(process.cwd(), 'src-tauri', 'target', 'release');
const binary =
  process.platform === 'win32'
    ? join(releaseDir, `${binaryName}.exe`)
    : join(releaseDir, binaryName);

if (!existsSync(binary)) {
  throw new Error(`Built app not found at ${binary}. Run \`npm run e2e:prepare\` first.`);
}

let tauriDriver;

export const config = {
  runner: 'local',
  specs: ['./e2e/**/*.spec.mjs'],
  maxInstances: 1,
  capabilities: [
    {
      'tauri:options': { application: binary },
    },
  ],
  hostname: '127.0.0.1',
  port: 4444,
  framework: 'mocha',
  mochaOpts: { timeout: 60000 },
  reporters: ['spec'],
  onPrepare: () => {
    tauriDriver = spawn('tauri-driver', [], {
      stdio: [null, process.stdout, process.stderr],
    });
  },
  onComplete: () => {
    if (tauriDriver) {
      tauriDriver.kill();
    }
  },
};
