import { readdir, readFile, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('dist/_worker.js')
const WASM_MAGIC = Buffer.from([0x00, 0x61, 0x73, 0x6d])

async function walk(dir, extensions) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath, extensions)))
      continue
    }
    if (extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath)
    }
  }

  return files
}

function patchDirname(code) {
  if (!code.includes('fileURLToPath(import.meta.url)')) return code

  return code
    .replace(
      /globalThis\[['"]__dirname['"]\]\s*=\s*path\.dirname\(fileURLToPath\(import\.meta\.url\)\)/g,
      "globalThis['__dirname'] = '/'",
    )
    .replace(
      /fileURLToPath\(import\.meta\.url\)/g,
      "fileURLToPath('file:///worker')",
    )
}

async function patchWasmArtifacts() {
  const wasmDir = path.join(root, 'wasm')
  let wasmFiles = []

  try {
    wasmFiles = await walk(wasmDir, ['.wasm'])
  } catch {
    return 0
  }

  const entries = []

  for (const file of wasmFiles) {
    const bytes = await readFile(file)
    const isWasm = bytes.length >= 4 && bytes.subarray(0, 4).equals(WASM_MAGIC)
    entries.push({ file, bytes, isWasm })
  }

  let realWasmFile = null
  let realWasmBytes = null
  let removed = 0

  for (const entry of entries) {
    if (!entry.isWasm) {
      await unlink(entry.file)
      removed += 1
      continue
    }

    if (!realWasmBytes || entry.bytes.length > realWasmBytes.length) {
      realWasmFile = entry.file
      realWasmBytes = entry.bytes
    }
  }

  if (!realWasmFile) return removed

  const wasmImportPath = `../${path.relative(root, realWasmFile).replace(/\\/g, '/')}`

  for (const entry of entries) {
    if (!entry.isWasm || entry.file === realWasmFile) continue
    if (entry.bytes.equals(realWasmBytes)) {
      await unlink(entry.file)
      removed += 1
    }
  }
  const shimFiles = await walk(path.join(root, '_wasm'), ['.mjs'])

  for (const file of shimFiles) {
    if (!file.includes('query_compiler')) continue

    await writeFile(
      file,
      `import wasm from '${wasmImportPath}'\nexport default wasm\n`,
    )
    removed += 1
  }

  return removed
}

const files = await walk(root, ['.mjs', '.js'])
let patched = 0

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const next = patchDirname(source)
  if (next !== source) {
    await writeFile(file, next)
    patched += 1
  }
}

const wasmPatched = await patchWasmArtifacts()

console.log(
  `Patched ${patched} worker modules and ${wasmPatched} Prisma WASM artifacts for Cloudflare`,
)
