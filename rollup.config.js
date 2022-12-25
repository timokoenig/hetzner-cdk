import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import packageJson from './package.json' assert { type: 'json' };

const outputDir = 'dist'

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id)
})

export default [
  bundle({
    plugins: [
      esbuild(),
      replace({
        __packageJsonVersion__: packageJson.version,
        preventAssignment: true
      })
    ],
    output: [
      {
        file: `${outputDir}/${packageJson.name}.cjs`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `${outputDir}/${packageJson.name}.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${outputDir}/${packageJson.name}.d.ts`,
      format: 'es',
    },
  }),
]
