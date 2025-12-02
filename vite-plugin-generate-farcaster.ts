import type { Plugin } from 'vite'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { minikitConfig } from './minikit.config.ts'

function deepCopyConfig(source: any): any {
  if (source === null || typeof source !== 'object') {
    return source
  }

  if (Array.isArray(source)) {
    return source.map(item => deepCopyConfig(item))
  }

  const target: any = {}
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = deepCopyConfig(source[key])
    }
  }
  return target
}

export function generateFarcasterJson(): Plugin {
  return {
    name: 'generate-farcaster-json',
    buildStart() {
      const outputDir = join(process.cwd(), 'public', '.well-known')
      mkdirSync(outputDir, { recursive: true })

      const farcasterJson = deepCopyConfig(minikitConfig)
      const outputPath = join(outputDir, 'farcaster.json')
      writeFileSync(outputPath, JSON.stringify(farcasterJson, null, 2), 'utf-8')
      
      console.log('✓ Generated farcaster.json at', outputPath)
    },
  }
}

