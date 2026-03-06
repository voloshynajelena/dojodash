import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  format: 'cjs',
  external: ['firebase-admin', 'firebase-functions'],
  sourcemap: true,
  minify: false,
  // Resolve workspace packages
  alias: {
    '@dojodash/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
  },
});

console.log('✅ Functions bundled successfully');
