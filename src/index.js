'use strict';

const MAX_LINES = 10_000;
const MAX_LINE_BYTES = 4_096;
const MAX_NESTING = 50;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function coerceValue(val) {
    if (val === '' || val === 'null' || val === '~') return null;
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
    return val;
}

function parseYamlLite(input) {
    const lines = Array.isArray(input) ? input : input.split(/\r?\n/);
    if (lines.length > MAX_LINES) {
        throw new Error(`Input exceeds ${MAX_LINES} line limit`);
    }

    const root = Object.create(null);
    const stack = [{ indent: -1, container: root }];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.length > MAX_LINE_BYTES) {
            throw new Error(`Line ${i + 1} exceeds ${MAX_LINE_BYTES} character limit`);
        }
        const trimmed = line.trim();
        if (!trimmed || line.startsWith('#')) continue;

        const rawLeading = line.slice(0, line.length - line.trimStart().length);
        if (rawLeading.includes('\t')) {
            throw new Error(`Tab indentation not allowed (line ${i + 1})`);
        }
        const indent = rawLeading.length;

        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) {
            throw new Error(`Missing ":" separator (line ${i + 1})`);
        }

        const key = trimmed.slice(0, colonIdx).trim();
        // ' #' (space before hash) starts an inline comment; '#' touching a
        // non-space character (tokens, hex colors) is kept as part of the value.
        const val = trimmed.slice(colonIdx + 1).trim().replace(/ #.*$/, '');

        if (!key) throw new Error(`Empty key (line ${i + 1})`);
        if (/\s/.test(key)) throw new Error(`Key contains whitespace (line ${i + 1})`);
        if (FORBIDDEN_KEYS.has(key)) throw new Error(`Forbidden key "${key}" (line ${i + 1})`);

        while (stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        const container = stack[stack.length - 1].container;
        if (key in container) throw new Error(`Duplicate key "${key}" (line ${i + 1})`);

        if (val === '|') {
            let blockLines = [];
            let blockIndent = -1;
            let j = i + 1;
            while (j < lines.length) {
                const nextLine = lines[j];
                const nextTrimmed = nextLine.trim();
                if (!nextTrimmed) {
                    blockLines.push('');
                    j++;
                    continue;
                }
                const nextLeading = nextLine.slice(0, nextLine.length - nextLine.trimStart().length);
                if (nextLeading.includes('\t')) {
                    throw new Error(`Tab indentation not allowed in block scalar (line ${j + 1})`);
                }
                const nextIndent = nextLeading.length;
                if (blockIndent === -1) {
                    if (nextIndent <= indent) break;
                    blockIndent = nextIndent;
                }
                if (nextIndent < blockIndent) break;
                blockLines.push(nextLine.slice(blockIndent));
                j++;
            }
            container[key] = blockLines.join('\n').trimEnd();
            i = j - 1;
        } else if (!val) {
            if (stack.length >= MAX_NESTING) {
                throw new Error(`Maximum nesting depth (${MAX_NESTING}) exceeded (line ${i + 1})`);
            }
            const child = Object.create(null);
            container[key] = child;
            stack.push({ indent, container: child });
        } else {
            container[key] = coerceValue(val);
        }
    }

    return root;
}

export { parseYamlLite };
