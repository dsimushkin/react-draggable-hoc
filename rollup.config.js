import typescript from "rollup-plugin-typescript2";
import external from "rollup-plugin-peer-deps-external";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import path from "path";
import fs from "fs";

const exclude = [
  "devUtils.ts",
  "PubSub.ts",
  "useRect.ts",
  "useForceUpdate.ts",
  "utils.ts",
  "IDragContext.ts",
  "throttle.ts",
  "index.ts",
];

const plugins = [
  external(),
  resolve(),
  typescript({
    clean: true,
  }),
];

export default fs
  .readdirSync("./src")
  .filter((file) => exclude.indexOf(file) < 0 && /\.ts[x]?$/.test(file))
  .map((file) => {
    const extInitial = path.extname(file);
    const basename = path.basename(file, extInitial);
    const ext = extInitial.replace("t", "j");

    return {
      input: `src/${file}`,
      output: [
        {
          file: `lib/${basename}${ext}`,
          format: "es",
          exports: "named",
          sourcemap: true,
        },
      ],
      plugins,
    };
  })
  .concat({
    input: "src/index.ts",
    output: [
      {
        file: "lib/index.js",
        format: "cjs",
        exports: "named",
        sourcemap: true,
      },
    ],
    plugins: [...plugins, commonjs()],
  });
