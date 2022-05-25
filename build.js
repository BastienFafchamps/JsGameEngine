const fs = require('fs');

function readFile(path) {
    return fs.readFileSync(path, { encoding: 'utf8' });
}

function getFullHtml() {
    console.log('Running build...');
    let output = '';

    let html = readFile('./src/index.html');
    html = html.replace(/( )*<link [a-zA-Z0-9.,:;'"/= ]*>\r\n/g, '');
    html = html.replace(/( )*<script [a-zA-Z0-9.,:;'"/= ]*><\/script>\r\n/g, '');
    
    console.log('Html loaded.');

    // Add css
    const cssFiles = [
        './src/css/main.css',
        './src/css/chary.css',
        './src/css/graph.css',
    ];

    let css = '<style>\n';
    cssFiles.forEach(file => {
        let content = readFile(file);
        css += content + '\n';
    });
    css += '</style>\n</head>\n';
    html = html.replace('</head>\r\n', css);
    console.log('Css loaded.');

    // Add js
    const jsCoreFiles = [
        './src/js/core.js',
        './src/js/engine.js',
        './src/js/codeParser.js',
        './src/js/main.js',
    ];

    const jsEditorFiles = [
        './src/js/modules/code.js',
        './src/js/modules/sprites.js',
        './src/js/modules/audio.js',
    ];

    let js = '<script type="text/javascript">\n';
    js += "const _CORE = () => {\n";
    jsCoreFiles.forEach(file => {
        let content = readFile(file);
        content = content.replace(/import ([{\w, \s}])* from ['"]([\w\/.])*['"];\r\n/g, '');
        content = content.replace(/export class ([a-zA-Z0-9]+)/g, 'window.$1 = class $1');
        content = content.replace(/export const ([a-zA-Z0-9]+)/g, 'window.$1 = $1');
        content = content.replace(/export function ([a-zA-Z0-9]+)/g, 'window.$1 = $1');
        js += content + '\n';
    });
    js += "};\n_CORE();\n";
    jsEditorFiles.forEach(file => {
        let content = readFile(file);
        content = content.replace(/import ([{\w, \s}])* from ['"]([\w\/.])*['"];\r\n/g, '');
        content = content.replace(/export /g, '');
        js += content + '\n';
    });
    js += '</script>\n</body>\n';
    html = html.replace('</body>\r\n', js);
    console.log('Js loaded.');

    // Output file
    const outputFilePath = './index.html';
    fs.writeFileSync(outputFilePath, html);
    console.log('Build finished!');
}

getFullHtml();