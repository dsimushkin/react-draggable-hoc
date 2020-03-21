import typescript from "rollup-plugin-typescript2";
import external from "rollup-plugin-peer-deps-external";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import path from "path";

const files = [
  "dragDropContainer.tsx",
  "draggable.tsx",
  "droppable.tsx",
  "helpers.ts",
  "useDraggableFactory.ts",
  "useDragPhaseListener.ts",
  "useMonitorListenerFactory.ts"
];

const plugins = [
  external(),
  resolve(),
  typescript({
    rollupCommonJSResolveHack: true,
    exclude: "**/__tests__/**",
    clean: true
  }),
  commonjs()
];

export default files
  .map(file => {
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
          sourcemap: true
        }
      ],
      plugins
    };
  })
  .concat({
    input: "src/index.ts",
    output: [
      {
        file: "lib/index.js",
        format: "cjs",
        exports: "named",
        sourcemap: true
      }
    ],
    plugins
  });
