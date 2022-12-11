import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import packageJson from './package.json' assert { type: 'json' }

const name = packageJson.name
const outputDir = 'dist'

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
})

export default [
  bundle({
    plugins: [esbuild()],
    output: [
      {
        file: `${outputDir}/${name}.cjs`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `${outputDir}/${name}.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${outputDir}/${name}.d.ts`,
      format: 'es',
    },
  }),
]
