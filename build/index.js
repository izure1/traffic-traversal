const esbuild = require('esbuild')

const common = {
  target: 'esnext',
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    { in: 'src/Helpers/VertexEncoder.ts', out: 'Helpers/VertexEncoder' }
  ],
  bundle: true
}

esbuild.build({
  ...common,
  format: 'cjs',
  outdir: 'dist/cjs',
  outExtension: {
    '.js': '.cjs'
  }
})

esbuild.build({
  ...common,
  format: 'esm',
  outdir: 'dist/esm',
  outExtension: {
    '.js': '.mjs'
  }
})
