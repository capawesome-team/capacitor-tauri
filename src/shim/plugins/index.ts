import { Dialog } from './dialog';
import { Filesystem } from './filesystem';
import { LocalNotifications } from './local-notifications';
import { Preferences } from './preferences';

/**
 * The curated Tier-2 implementations registered under the `tauri` platform.
 * Keep aligned with `shared/catalog.ts` (which drives the capability
 * codegen).
 */
export const curatedPlugins: {
  name: string;
  implementation: Record<string, unknown>;
}[] = [
  { name: 'Filesystem', implementation: Filesystem },
  { name: 'Preferences', implementation: Preferences },
  { name: 'Dialog', implementation: Dialog },
  { name: 'LocalNotifications', implementation: LocalNotifications },
];
