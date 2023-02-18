const path = require('path')
const esbuild = require('esbuild')
const { dtsPlugin } = require('esbuild-plugin-d.ts')

const common = {
  target: 'esnext',
  plugins: [
    dtsPlugin()
  ]
}

esbuild.build({
  ...common,
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/Helpers/VertexEncoder.ts', out: 'Helpers/VertexEncoder' }
  ],
  outdir: 'dist/cjs',
  format: 'cjs',
  bundle: true,
})

esbuild.build({
  ...common,
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/Helpers/VertexEncoder.ts', out: 'Helpers/VertexEncoder' },
  ],
  outdir: 'dist/esm',
  format: 'esm',
  bundle: true,
})
