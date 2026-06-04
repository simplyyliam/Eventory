import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  // This explicitly instructs tsup to bundle our workspace packages instead of leaving them external
  noExternal: ['@app/shared'], 
});