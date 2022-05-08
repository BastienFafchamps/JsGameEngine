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
        './src/main.css',
        './src/fonts/chary.css',
        './src/fonts/graph.css',
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
    const jsFiles = [
        './src/js/engine.js',
        './src/js/main.js',
        './src/js/codeParser.js',
        './src/js/editor.js',
    ];

    let js = '<script  type="text/javascript">\n';
    jsFiles.forEach(file => {
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