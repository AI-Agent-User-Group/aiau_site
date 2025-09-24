import { defineConfig } from 'vite';
import tailwind from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { cpSync, mkdirSync, existsSync } from 'node:fs';

// Simple plugin to copy ./md to ./dist/md after build, so runtime fetch('/md/*.md') works
function copyMdFolder() {
  return {
    name: 'copy-md-folder',
    apply: 'build' as const,
    closeBundle() {
      const srcDir = resolve(process.cwd(), 'md');
      const destDir = resolve(process.cwd(), 'dist', 'md');
      try {
        if (!existsSync(srcDir)) return;
        mkdirSync(destDir, { recursive: true });
        cpSync(srcDir, destDir, { recursive: true });
        // eslint-disable-next-line no-console
        console.log(`[copy-md-folder] Copied md → ${destDir}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[copy-md-folder] Failed to copy md folder', error);
      }
    },
  };
}

export default defineConfig({
  plugins: [tailwind(), copyMdFolder()],
});


