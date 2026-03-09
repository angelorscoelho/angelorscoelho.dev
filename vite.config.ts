
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const RESUME_ASSET_NAME = 'resume.pdf';

/** Read the resume commit SHA short from resume-meta.json (written by CI).
 *  Returns an empty string when the file is absent or malformed so the build
 *  degrades gracefully to Vite's default content-hash naming. */
function getResumeShaShort(): string {
  const metaPath = join(process.cwd(), 'src/assets/resume-meta.json');
  if (!existsSync(metaPath)) return '';
  try {
    const meta: unknown = JSON.parse(readFileSync(metaPath, 'utf8'));
    if (meta && typeof meta === 'object' && 'shaShort' in meta && typeof (meta as Record<string, unknown>).shaShort === 'string') {
      return (meta as Record<string, string>).shaShort;
    }
    return '';
  } catch {
    return '';
  }
}

const resumeShaShort = getResumeShaShort();

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        /** Use the resume commit SHA as the PDF filename suffix so the deployed
         *  URL (`/assets/resume-{sha}.pdf`) matches the commit captured in
         *  resume-meta.json — instead of Vite's random content hash. */
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === RESUME_ASSET_NAME && resumeShaShort) {
            return `assets/resume-${resumeShaShort}.pdf`;
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
