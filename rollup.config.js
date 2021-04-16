import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json';

export default {
  input: 'src/index.tsx',
  output: [
    { file: pkg.main, format: 'cjs' },
  ],
  plugins: [
    resolve({
      mainFields: ['module', 'main'],
      customResolveOptions: {
        moduleDirectory: 'src',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs({
      extensions: ['.js'],
      include: 'node_modules/**',
    }),
    postcss({
      modules: true,
      extract: true,
      sourceMap: true,
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
};
