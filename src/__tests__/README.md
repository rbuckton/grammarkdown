## Grammar tests using `.grammar` files
Grammar tests are handled by `scripts/grammarTest.js`, which is a Jest transformer that generates a set of tests from a `.grammar` file. This transformer is referenced in `jest.config.js`:

```js
module.exports = {
    ...,
    moduleFileExtensions: [
        "js",
        "jsx",
        "ts",
        "tsx",
        "json",
        "node",
        "grammar" // added here to be recognized as a test module by Jest
    ],
    transform: {
        ...,
        "^.+\\.grammar": require.resolve("./scripts/grammarTest.js") // specifies transformer for .grammar
    },
    testRegex: "/__tests__/.*(\\.test\\.ts|\\.grammar)$", // pick up .grammar files for tests
    ...
};
```