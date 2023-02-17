const path = require('path')
const esbuild = require('esbuild')

const common = {
  target: 'esnext'
}

esbuild.buildSync({
  ...common,
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/Helpers/VertexEncoder.ts', out: 'Helpers/VertexEncoder' }
  ],
  outdir: 'dist/cjs',
  format: 'cjs',
  bundle: true,
})

esbuild.buildSync({
  ...common,
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/Helpers/VertexEncoder.ts', out: 'Helpers/VertexEncoder' },
  ],
  outdir: 'dist/esm',
  format: 'esm',
  bundle: true,
})
