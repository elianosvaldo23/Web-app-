const fs = require('fs');
const path = require('path');
const recast = require('recast');
const babelParser = require('@babel/parser');

const directoryToScan = './src';
const report = [];

function toKey(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 40);
}

function scanFile(filePath) {
    try {
        const code = fs.readFileSync(filePath, 'utf8');
        const ast = babelParser.parse(code, {
            sourceType: 'module',
            plugins: [
                'jsx',
                'typescript',
                'classProperties',
                'objectRestSpread',
                'optionalChaining',
                'nullishCoalescingOperator',
            ],
            errorRecovery: true,
        });

        recast.types.visit(ast, {
            // Text directly inside JSX
            visitJSXText(path) {
                const text = path.node.value.trim();
                if (text.length > 1 && /\w/.test(text)) {
                    const loc = path.node.loc?.start || { line: 0 };
                    report.push({
                        file: filePath,
                        line: loc.line,
                        string: text,
                        key: toKey(text),
                    });
                }
                this.traverse(path);
            },

            // { "hello" } style
            visitJSXExpressionContainer(path) {
                const expr = path.node.expression;

                // Skip expressions that call t()
                if (
                    expr.type === 'CallExpression' &&
                    expr.callee.type === 'Identifier' &&
                    expr.callee.name === 't'
                ) {
                    return false;
                }

                // Find only { "text" } expressions
                if (expr.type === 'StringLiteral') {
                    const parent = path.parentPath.node;
                    if (parent.type === 'JSXElement') {
                        const loc = path.node.loc?.start || { line: 0 };
                        report.push({
                            file: filePath,
                            line: loc.line,
                            string: expr.value,
                            key: toKey(expr.value),
                        });
                    }
                }

                this.traverse(path);
            }
        });

    } catch (err) {
        console.warn(`❌ Skipping ${filePath}: ${err.message}`);
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
            console.log('Scanning file:', fullPath);
            scanFile(fullPath);
        }
    });
}

function writeReport() {
    const header = `File,Line,Hardcoded String,Suggested Key\n`;
    const rows = report.map((row) =>
        `"${row.file}",${row.line},"${row.string.replace(/"/g, '""')}","${row.key}"`
    );
    fs.writeFileSync('i18n-report.csv', header + rows.join('\n'));
    console.log('✅ Report written to i18n-report.csv');
}

walk(directoryToScan);
writeReport();
