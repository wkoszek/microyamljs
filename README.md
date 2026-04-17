# microyamljs

This is a small, robust parser for a subset of the YAML data format. It is designed to be simple to understand and easy to embed. The implementation is approximately 80 lines of JavaScript.

## Rationale

Most hierarchical data formats are either overly complex to parse (YAML) or cumbersome for humans to edit (JSON). This parser provides a middle ground: it uses indentation to represent structure, but remains small enough to be verified by a single person in a few minutes.

## The Format

The parser recognizes a subset of YAML defined by the following rules:

1.  **Hierarchy**: Nesting is determined by the number of leading spaces. Use of tabs is prohibited.
2.  **Comments**: Any line beginning with `#` at the first column is ignored. Inline comments are not supported; the `#` character is treated as part of the value if it appears after a colon.
3.  **Keys and Values**: A colon (`:`) separates a key from its value. The value is "greedy"—everything following the first colon is part of the string.
4.  **Multi-line Strings**: A value consisting of the single character `|` introduces a block scalar. All subsequent lines with greater indentation than the key are collected and joined with newlines.
5.  **Types**: Values are automatically converted to nulls, booleans, or numbers where the representation is unambiguous.

## Usage

The parser is provided as a single function, `parseYamlLite`, which takes an array of strings and returns a null-prototype object.

```javascript
const { parseYamlLite } = require('./index');
const lines = [
    'server:',
    '  port: 8080',
    '  banner: |',
    '    Welcome to',
    '    the system.'
];
const config = parseYamlLite(lines);
```

## Implementation Notes

The parser uses a stack-based approach to build the tree in a single pass. For security, all objects are created with `Object.create(null)` to prevent prototype pollution. The code explicitly rejects duplicate keys and deep nesting beyond 50 levels to prevent resource exhaustion.

## Bugs

The parser is intentionally limited. It does not support lists (`- item`), quoted strings, or complex YAML features like anchors. If you require these, you should use a more comprehensive library.

## License

MIT

## Author

Adam Koszek
