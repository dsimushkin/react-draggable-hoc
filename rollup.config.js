import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        }
    ],
    external: [
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.dependencies || {}),
    ],
    plugins: [
        typescript({
            clean: true
        }),
    ],
}