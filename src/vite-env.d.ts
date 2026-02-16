/// <reference types="vite/client" />

// Custom module declarations for non-code assets so TypeScript can import them.
// Place this file at `src/vite-env.d.ts` (or any `*.d.ts` inside `src/`) —
// tsconfig.json's `include` ("**/*.ts") will pick it up automatically.

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.pdf' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}
