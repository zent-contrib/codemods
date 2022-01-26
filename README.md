# codemods for zent

**⚠️ Codemods are not guaranteed to be safe for all inputs, you must review the output.**

Before using zent-codemod in your project, please **CLEAN WORKING TREE** of `git` to allow rollback after transform.

It's **NOT** guaranteed that all breaking changes detected. Anyway, It's necessary to look through [Change Log](https://youzan.github.io/zent/zh/guides/changelog).

⚠️ Codemods inferences components that be used in a file by analyzing import statements. This means the components which be imported by object destruction like `const { Trigger } = Popover` **CANNOT** be discovered by analyzer.

## Transformers

- `explicit-optional-props`: Explicitly pass optional props whose default value has breaking change.

- `legacy-to-compat`: Move legacy components to `@zent/compat`.

- `refactor-loading`: Transform `Loading` elements as much as possible. Only for `--target 7`

- `remove-deprecated-props`: Remove deprecated props.

- `rename-props`: Rename props whose name has been change.

- `rename-string`: Rename literal string of some props which has been renamed.

- `rename-component`: Rename components whose name has been change.

- `switch-boolean-props`: Switch props which is boolean type as much as possible, and rename them ( if necessary ).

- `cannot-transform`: list the changes cannot be transformed.

## Test

run `yarn test` to see the testing transform.

## Usage

```sh
zent-codemod [transformer] [pattern] [options]
```

```sh
# use configuration file
zent-codemod
```

```sh
# run specified transformer with pattern
zent-codemod \
legacy-to-compat \
"./src/**/*.{js,jsx,tsx}" \
-t 7
```

```sh
# run all transformers
zent-codemod all "./src/**/*.+(js,jsx,tsx)"
```

## Options

- target: the target major release of zent, default is **latest major release**
- silent: no stdout, default is `false`
- output: write to stdout instead of overwriting files, default is `false`
- color: language for highlight when `output` enabled, default is `typescript`
- quote: style of quote. `'auto' | 'single' | 'double'` is valid, default is `auto`
- force: skip check for git working tree, default is `false`

## zent-codemod.json

```json
{
  "pattern": "**/*",
  "transformers": ["legacy-to-compat"],
  "options": {
    "target": 8,
    "silent": false,
    "output": false,
    "color": "typescript",
    "quote": "auto",
    "force": false
  }
}
```
