import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { unwasm } from 'unwasm/plugin'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const cloudflarePages = process.env.NITRO_PRESET === 'cloudflare_pages'

function prismaCloudflareRollupShim() {
  const patch = (code: string) => {
    if (!code.includes('fileURLToPath(import.meta.url)')) return null
    let next = code
    next = next.replace(
      /globalThis\[['"]__dirname['"]\]\s*=\s*path\.dirname\(fileURLToPath\(import\.meta\.url\)\)/g,
      "globalThis['__dirname'] = '/'",
    )
    next = next.replace(
      /fileURLToPath\(import\.meta\.url\)/g,
      "fileURLToPath('file:///worker')",
    )
    return next
  }

  return {
    name: 'prisma-cloudflare-shim',
    transform(code: string) {
      const next = patch(code)
      return next ? { code: next, map: null } : null
    },
    renderChunk(code: string) {
      const next = patch(code)
      return next ? { code: next, map: null } : null
    },
  }
}

const config = defineConfig({
  envPrefix: ['VITE_', 'SITE_'],
  resolve: { tsconfigPaths: true },
  plugins: [
    ...(process.env.NODE_ENV === 'development' ? [devtools()] : []),
    unwasm({
      esmImport: cloudflarePages,
    }),
    nitro({
      ...(cloudflarePages
        ? {
            preset: 'cloudflare_pages',
            cloudflare: {
              deployConfig: true,
              nodeCompat: true,
              wrangler: {
                name: 'wollie',
                hyperdrive: [
                  {
                    binding: 'HYPERDRIVE',
                    id: 'fdf126ff544b473c87540b89bacedca7',
                  },
                ],
              },
            },
          }
        : {}),
      rollupConfig: {
        external: [/^@sentry\//],
        plugins: cloudflarePages ? [prismaCloudflareRollupShim()] : [],
      },
    }),
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
