//
// Copyright 2020 DXOS.org
//

import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import analyze from 'rollup-plugin-analyzer';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const useAnalyze = process.env.ANALYZE === 'true';

const plugins = [
  resolve({
    preferBuiltins: true
  }),
  babel({
    babelHelpers: 'bundled'
  }),
  commonjs(),
  terser({
    compress: false
  })
];

if (useAnalyze) {
  plugins.push(analyze({
    summaryOnly: true
  }));
}

export default [
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true }
    ],
    plugins,
    external (id) { return !/^[./]/.test(id); }
  }
];
