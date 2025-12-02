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
    transformIndexHtml(html) {
      const miniappMeta = {
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: "Stablecoins to any chain",
          action: {
            type: "launch_frame",
            name: "Launch Stableflow"
          }
        }
      }

      const metaContent = JSON.stringify(miniappMeta)
      const metaTag = `<meta name="fc:miniapp" content='${metaContent}' />`

      const existingMetaRegex = /<meta\s+name=["']fc:miniapp["'][^>]*>/i
      if (existingMetaRegex.test(html)) {
        return html.replace(existingMetaRegex, metaTag)
      }

      return html.replace('</head>', `    ${metaTag}\n  </head>`)
    },
  }
}

