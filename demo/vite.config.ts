import { PluginOption, defineConfig } from 'vite'
import { run } from 'vite-plugin-run'

const plugins: PluginOption[] = []

if (process.env.NODE_ENV !== 'production') {
  plugins.push(run([
    {
      name: 'Transpile worker',
      run: ['pnpm run worker'],
      condition: file => file.includes('worker.ts')
    }
  ]))
}

export default defineConfig({
  plugins
})
