import { addCommand } from './add';
import { readCliContext } from './context';
import { openCommand, runCommand } from './launch';
import { fail } from './log';
import { copyCommand, updateCommand } from './sync';

async function main(): Promise<void> {
  const [, , command] = process.argv;
  const context = readCliContext();
  switch (command) {
    case 'add':
      return addCommand(context);
    case 'copy':
      return copyCommand(context);
    case 'update':
      return updateCommand(context);
    case 'open':
      return openCommand(context);
    case 'run':
      return runCommand(context);
    default:
      fail(`Unknown command: ${command ?? '(none)'}`);
  }
}

main().catch(error => {
  fail(error instanceof Error ? error.message : String(error));
});
