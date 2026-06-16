import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    ...(process.env.NODE_ENV === 'development' ? [devtools()] : []),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  ssr: {
    external: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
    noExternal: [],
  },
  optimizeDeps: {
    exclude: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  },
})

export default config
