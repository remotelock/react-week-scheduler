import babel from 'rollup-plugin-babel';
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
    postcss({
      modules: false,
      autoModules: false,
      extract: true,
      sourceMap: true,
    }),
    resolve({
      customResolveOptions: {
        moduleDirectory: 'src',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
};
