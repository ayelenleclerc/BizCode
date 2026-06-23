import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeAppConfig } from './config/env.js'
import { startServer } from './server.js'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
loadEnv({ path: path.join(repoRoot, '.env') })

initializeAppConfig()
startServer()