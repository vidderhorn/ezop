# ezop

> options parsing library

- just parsing
- no coercion
- no validation
- simple conventions
- optional config
- about 100 lines of code

## Usage

### Simple

```ts
import parse from "ezop";

console.log(parse(`file.txt --hello world -abc -i foo -i bar -xx -- more stuff`.split(/\s/)));
```
```js
{
  args: [ 'file.txt' ],
  flags: { hello: 'world', i: 'bar' },
  bits: { a: true, b: true, c: true, x: true },
  lists: { hello: [ 'world' ], i: [ 'foo', 'bar' ] },
  levels: { a: 1, b: 1, c: 1, x: 2 },
  raw: [ 'more', 'stuff' ]
}
```

The object produced is flexible, providing several ways to examine the options. Double-dashed `flags` with values are also included in the `lists` by default. Those options determined to be `bits` are likewise found in the `levels` object.

- `args`: un-dashed, "positional" options
- `flags`: string values provided by dashed options
- `bits`: boolean values activated by dashed options
- `lists`: lists of strings specified by repeated options
- `levels`: integers incremented by repeated options
- `raw`: any options following the `--` marker

### With settings

Settings configure the parser with optional aliases and types. This will clean up the produced options object and remove ambiguities in some situations.

```ts
import parse, { bit, list, level } from "ezop";

console.log(parse(`-v file.txt -p src -i foo -l`.split(/\s/), {
  project: "p",
  verbose: bit("v"),
  include: list("i"),
  log: level("l"),
}));
```
```js
{
  args: [ 'file.txt' ],
  flags: { project: 'src' },
  bits: { verbose: true },
  lists: { include: [ 'foo' ], project: [ 'src' ] },
  levels: { log: 1 },
  raw: []
}
```

### Conventions

These are assumed when a type is not configured for the setting.

- double-dashed options are both flags and lists
- single-dashed, single-character options are both flags and lists
- single-dashed, multi-character options are both bits and levels
- if flag/list options are followed by a dashed option, the string value will be empty
