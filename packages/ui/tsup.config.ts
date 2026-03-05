import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/theme/index.ts',
    'src/providers/index.ts',
    'src/components/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@mantine/core', '@mantine/hooks', '@mantine/dates', '@mantine/form', '@mantine/notifications'],
});
