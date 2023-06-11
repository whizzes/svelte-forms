import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";

export default {
  input: "src/index.ts",
  output: [
    { file: "./dist/index.mjs", format: "es", sourcemap: true },
    {
      file: "./dist/index.js",
      format: "umd",
      name: "@whizzes/svelte-forms",
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
