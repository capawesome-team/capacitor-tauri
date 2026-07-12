import { spawn } from 'child_process';

import type { CliContext } from './context';
import { requireTauriDir } from './context';
import { logInfo } from './log';
import { copyCommand, updateCommand } from './sync';

export async function runCommand(context: CliContext): Promise<void> {
  requireTauriDir(context);
  await copyCommand(context);
  await updateCommand(context);
  const devUrl = context.config.server?.url;
  const args = ['tauri', 'dev'];
  if (devUrl) {
    logInfo(`Using dev server at ${devUrl}.`);
    args.push('--config', JSON.stringify({ build: { devUrl } }));
  }
  await runTauriCli(context, args);
}

export async function openCommand(context: CliContext): Promise<void> {
  requireTauriDir(context);
  // Tauri has no dedicated "open in IDE" command; build the app instead.
  await copyCommand(context);
  await updateCommand(context);
  await runTauriCli(context, ['tauri', 'build']);
}

function runTauriCli(context: CliContext, args: string[]): Promise<void> {
  logInfo(`Running \`npx ${args.join(' ')}\`...`);
  return new Promise((resolve, reject) => {
    const child = spawn('npx', args, {
      cwd: context.rootDir,
      shell: true,
      stdio: 'inherit',
    });
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tauri CLI exited with code ${code ?? 'null'}.`));
      }
    });
    child.on('error', reject);
  });
}
