import autoExternal from 'rollup-plugin-auto-external';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json';

export default {
  input: 'src/index.tsx',
  output: [
    { file: pkg.module, format: 'es' },
    { file: pkg.main, format: 'cjs' },
  ],
  plugins: [
    autoExternal(),
    postcss({
      modules: true,
      extract: true,
      sourceMap: true,
    }),
    commonjs({
      extensions: ['.js', '.mjs'],
    }),
    resolve({
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
};
