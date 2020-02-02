import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const production = !process.env.ROLLUP_WATCH;

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, "$3")
  .replace(/^\w/, m => m.toUpperCase())
  .replace(/-\w/g, m => m[1].toUpperCase());

export default [
  {
    input: "example/main.js",
    output: {
      sourcemap: true,
      format: "iife",
      name: "app",
      file: "public/build/bundle.js"
    },
    plugins: [
      svelte({
        dev: !production,
        css: css => {
          css.write("public/build/bundle.css");
        }
      }),
      resolve({
        browser: true,
        dedupe: importee =>
          importee === "svelte" || importee.startsWith("svelte/")
      }),
      commonjs(),
      !production && serve(),
      !production && livereload("public"),
      production && terser()
    ],
    watch: {
      clearScreen: false
    }
  },
  {
    input: "src/index.js",
    output: [
      { file: pkg.module, format: "es" },
      { file: pkg.main, format: "umd", name }
    ],
    plugins: [svelte(), resolve(), commonjs()]
  }
];

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true
        });
      }
    }
  };
}
