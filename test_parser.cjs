'use strict';

const fs = require('fs');
const { parseYamlLite } = require('./dist/index.cjs');

const MAX_FILE_BYTES = 1 * 1024 * 1024;  // 1 MB

try {
    const filePath = 'config.yaml';
    const openFlags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0);
    const fd = fs.openSync(filePath, openFlags);
    let data;
    try {
        const { size } = fs.fstatSync(fd);
        if (size > MAX_FILE_BYTES) {
            throw new Error(`${filePath} exceeds ${MAX_FILE_BYTES / 1024} KB size limit`);
        }
        data = fs.readFileSync(fd, 'utf8');
    } finally {
        fs.closeSync(fd);
    }

    const config = parseYamlLite(data.split(/\r?\n/));
    console.log('Parsed YAML-Lite Structure (JS - Library + Test):');
    console.log(JSON.stringify(config, null, 2));
} catch (err) {
    if (err.code === 'ENOENT') {
        console.error('Error: config.yaml not found.');
    } else {
        console.error('Error:', err.message);
    }
    process.exit(1);
}
