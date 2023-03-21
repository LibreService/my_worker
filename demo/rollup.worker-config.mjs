import { nodeResolve } from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'

const isProd = process.env.NODE_ENV === 'production'

export default {
  input: 'src/worker.ts',
  output: {
    dir: 'public',
    sourcemap: !isProd,
    format: 'iife'
  },
  plugins: [
    nodeResolve(),
    esbuild({
      sourceMap: !isProd,
      minify: isProd
    })
  ]
}
