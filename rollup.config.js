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
    resolve({
      jsnext: true,
      main: true,
      customResolveOptions: {
        moduleDirectory: 'src',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs({
      extensions: ['.js', '.mjs'],
      include: 'node_modules/**',
    }),
    postcss({
      modules: true,
      extract: true,
      sourceMap: true,
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
};
