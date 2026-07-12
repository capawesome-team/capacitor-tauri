import { chmodSync } from 'fs';
import { builtinModules } from 'module';

const external = id => id.startsWith('node:') || builtinModules.includes(id);

const bundle = (name, { banner, executable } = {}) => ({
  input: `build/${name}/index.js`,
  output: {
    file: `dist/${name}/index.js`,
    format: 'cjs',
    exports: 'auto',
    inlineDynamicImports: true,
    banner,
  },
  external,
  plugins: executable
    ? [
        {
          name: 'executable',
          writeBundle(options) {
            chmodSync(options.file, 0o755);
          },
        },
      ]
    : [],
});

export default [
  bundle('runtime'),
  bundle('cli', { banner: '#!/usr/bin/env node', executable: true }),
];
