module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: [
        "js",
        "jsx",
        "ts",
        "tsx",
        "json",
        "node",
        "grammar"
    ],
    transform: {
        "^.+\\.tsx?": "ts-jest",
        "^.+\\.grammar": require.resolve("./scripts/grammarTest.js")
    },
    testRegex: "/__tests__/.*(\\.test\\.ts|\\.grammar)$",
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
            compiler: require.resolve('typescript')
        },
    }
};