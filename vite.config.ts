import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    // The story reader waits for the browser and for the voice, so its tests
    // need more room than the default five seconds.
    testTimeout: 20000,
    // `.delta` holds stale copies of the app in a worktree: their tests are
    // not ours to run.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.delta/**'],
  },
})
