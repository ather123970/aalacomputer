import serverless from 'serverless-http'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

// Resolve backend path and import the app
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendIndex = path.join(__dirname, '..', 'backend', 'index.cjs')

let appModule = null
let app = null
// First try to require the CJS module from ESM using createRequire (preferred for backend/index.cjs)
try {
  const requireFromThis = createRequire(import.meta.url)
  appModule = requireFromThis(backendIndex)
  app = appModule && (appModule.app || appModule.default || appModule)
} catch (e) {
  // fallback to dynamic import if createRequire fails (older Node or path issues)
  try {
    const url = `file://${backendIndex}`
    appModule = await import(url)
    app = appModule && (appModule.app || appModule.default || appModule)
  } catch (err) {
    console.error('Failed to load backend app for serverless (createRequire and dynamic import failed):', err)
    throw err
  }
}

if (!app) {
  const err = new Error('Backend app not found for serverless wrapper')
  console.error(err)
  throw err
}

export const handler = serverless(app)
