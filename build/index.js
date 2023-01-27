const path = require('path')
const esbuild = require('esbuild')

const common = {
  entryPoints: [path.resolve(__dirname, '../src/index.ts')],
  target: 'esnext',
  bundle: true,
}

esbuild.buildSync({
  ...common,
  outfile: path.resolve(__dirname, '../dist', 'cjs', 'index.js'),
  format: 'cjs'
})

esbuild.buildSync({
  ...common,
  outfile: path.resolve(__dirname, '../dist', 'esm', 'index.js'),
  format: 'esm'
})
