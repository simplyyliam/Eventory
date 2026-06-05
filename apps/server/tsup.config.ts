import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  // This tells tsup to bundle all local workspace packages into your server code
  noExternal: ['@app/shared'], // only bundle shared, not database
  external: ['@app/database', '@prisma/client', '@prisma/adapter-pg', 'pg'],
});
