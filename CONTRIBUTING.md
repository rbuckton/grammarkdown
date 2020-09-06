# Contributing to Grammarkdown

You may contribute to Grammarkdown either by filing issues or through PRs.

Please also ensure that your contributions follow both the [GitHub Terms of Service](https://docs.github.com/en/articles/github-terms-of-service) and [GitHub Community Guidelines](https://docs.github.com/articles/github-community-guidelines).

## Building from Source

To build Grammarkdown from source you will need the following dependencies:

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/) LTS (which includes `npm` and `npx`)
- Either a global installation of [`gulp`](https://gulpjs.com/) (i.e., `npm install -g gulp`), or you can execute `gulp` via `npx` for any of the build tasks below (i.e., `npx gulp ...`).

Build steps:

```sh
# clone the repository
git clone https://github.com/rbuckton/grammarkdown.git
cd grammarkdown

# install dependencies
npm install

# build the package and run tests
gulp
```

You can also run the build in "watch" mode, which will recompile and run all tests whenever a file change is detected:

```sh
gulp watch
```

## Adding or Modifying Sources

Grammarkdown is developed using [TypeScript](https://typescriptlang.org).

## Running Tests

To run the tests you can use the following command:

```sh
gulp test
```

To view any differences in output from our baseline comparison tests, ensure your `DIFF` environment variable is set to a
valid executable capable of handling directory diffs and use the following command:

```sh
gulp diff
```

If all of the baseline tests are acceptable, you can accept the new baselines using the following command:

```sh
gulp accept-baselines
```

## Adding Tests

### Grammar Tests

Grammarkdown primarily uses baseline comparison tests that exercise the entire compiler and are written as `.grammar` files
under the `~/src/tests/resources` folder. Related functionality is generally grouped together in a subfolder.
These tests are evaluated by `~/src/tests/grammar-tests.ts`. Reference baselines can be found in `~/baselines/reference` and
generated outputs can be found in `~/baselines/local`.

You are able to control some of the behavior of `.grammar` tests with `// @directive: value` comments at the top of the file.
The supported test comment directives can be found in the following table:

| directive     | value                                  | description |
|:--------------|:--------------------------------------:|:------------|
| `full`        | `true`, `false`                        | When `true`, enables all of the test directives and output formats. Default: `false` |
| `tokens`      | `true`, `false`                        | When `true`, emits a `.tokens` file that contains the tokens parsed from the file. Default: `false` |
| `nodes`       | `true`, `false`                        | When `true`, emits a `.nodes` file that contains the AST nodes parsed from the file. Default: `false` |
| `diagnostics` | `true`, `false`                        | When `true`, emits a `.diagnostics` file that contains any diagnostic messages that result from parsing and checking the grammar. Default: `true` |
| `emit`        | `ecmarkup`, `markdown`, `html`, `none` | Indicates the output format for the tests. Multiple formats can be combined using `,`. Default: `ecmarkup` |

### Unit Tests

In addition, Grammarkdown also uses unit tests found underneath `~/src/tests/`. Unit tests are authored
using [Mocha](https://mochajs.org/).

## Generating Documentation

The documentation for Grammarkdown is generated using [`api-extractor`](https://api-extractor.com/),
[`api-documenter`](https://api-extractor.com/pages/setup/generating_docs/), and [`docfx`](https://dotnet.github.io/docfx/).
While `api-extractor` and `api-documenter` are development dendencies that will be installed for you, `docfx` is an
external executable that must be installed manually. Instructions for installation can be found on the [DocFX website](https://dotnet.github.io/docfx/).

To generate documentation use the following command:

```sh
gulp docs
```

## Localization

Grammarkdown is not currently localized. All documentation and diagnostics are currently only provided in English. We will consider adding
localization support if there is enough interest.