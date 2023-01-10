import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';

import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'src/index.ts',
  output: [
    { dir: pkg.module, format: 'es', sourcemap: true },
    {
      dir: pkg.main,
      format: 'umd',
      name: '@whizzes/svelte-forms',
      sourcemap: true,
    },
  ],
  plugins: [
    commonjs(),
    typescript({
      rollupCommonJSResolveHack: false,
      clean: true,
    }),
    svelte(),
    resolve(),
  ],
};
