# codemods for zent

**⚠️ Codemods are not guaranteed to be safe for all inputs, you must review the output.**

To use these codemods, please install https://github.com/facebook/jscodeshift first.

## rename-to-zent-compat

This codemod renames a component import from `zent` to `@zent/compat`.

#### In

```js
import { Button, Form } from 'zent';
```

#### Out

```js
// Only rename Form
import { Button } from 'zent';
import { Form } from '@zent/compat';
```

#### Usage

This transform has two options:

- `component`: component to rename
- `quote`: single or double quote, double is default

```bash
# .ts files
jscodeshift \
  -t rename-to-zent-compat.js \
  --no-babel \
  --extensions=ts \
  --parser=ts \
  --component=Form \
  --quote=single \
  /path/to/your/code/directory

# tsx
jscodeshift \
  -t rename-to-zent-compat.js \
  --no-babel \
  --extensions=tsx \
  --parser=tsx \
  --component=Form \
  --quote=single \
  /path/to/your/code/directory

# js/jsx
jscodeshift \
  -t rename-to-zent-compat.js \
  --no-babel \
  --extensions='js,jsx' \
  --parser=babylon \
  --component=Form \
  --quote=single \
  /path/to/your/code/directory
```