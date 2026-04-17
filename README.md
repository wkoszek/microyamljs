# microyamljs

Minimal, secure YAML-like config parser. No dependencies. ~3 KB.

## Use via CDN — no install required

Drop this into any HTML page:

```html
<script type="module">
import { parseYamlLite }
  from 'https://cdn.jsdelivr.net/npm/microyamljs/dist/index.mjs';

const config = parseYamlLite(`
server:
  host: localhost
  port: 8080
  debug: true
`);

console.log(config.server.port);  // 8080
console.log(config.server.debug); // true
</script>
```

## Install

```bash
npm install microyamljs
```

## Node.js — CommonJS

```js
const { parseYamlLite } = require('microyamljs');

const config = parseYamlLite(`
server:
  host: localhost
  port: 8080
`);

console.log(config.server.port); // 8080
```

## Node.js — ESM

```js
import { parseYamlLite } from 'microyamljs';

const config = parseYamlLite(`
server:
  host: localhost
  port: 8080
`);

console.log(config.server.port); // 8080
```

## Supported syntax

```yaml
# Comments — column 0 only
key: value              # inline comments after space + #
nested:
  child: value          # nesting via indentation (spaces only)
number: 42              # → number
flag: true              # → boolean  (true / false)
nothing: null           # → null     (also: ~ or empty value)

block: |                # multi-line block scalar
  line one
  line two
```

## Limits

| Setting | Value |
|---|---|
| Max file size | 1 MB |
| Max lines | 10,000 |
| Max line length | 4,096 characters |
| Max nesting | 50 levels |
| Tabs | not allowed (throws) |
| Lists (`- item`) | not supported |
| Quoted strings | not supported |
| Duplicate keys | throws |

## Security

All output objects are created with `Object.create(null)` — no prototype chain, no pollution risk. Prototype key names (`__proto__`, `constructor`, `prototype`) are explicitly rejected. Duplicate keys throw rather than silently overwriting.

## Build

```bash
make        # build CJS + ESM to dist/
make test   # build then run test_parser.cjs
make clean  # remove dist/ and node_modules/
```

## Rationale

Most hierarchical config formats are either too complex to parse (full YAML) or awkward for humans to edit (JSON). This parser is a single-pass, ~100-line function you can read and verify in a few minutes.

## License

MIT — Adam Koszek
