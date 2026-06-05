import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  // This tells tsup to bundle all local workspace packages into your server code
  noExternal: ['@app/shared', '@app/database'], 
});