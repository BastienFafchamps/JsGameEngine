export class CodeParser {
    constructor() {
        this.punctuations = {
            '.': { type: 'punctuation', },
            ';': { type: 'punctuation', },
            '!': { type: 'punctuation', },
            '(': { type: 'separator', },
            ')': { type: 'separator', },
            '{': { type: 'separator', },
            '}': { type: 'separator', },
            '[': { type: 'separator', },
            ']': { type: 'separator', },
        }

        this.literals = {
            'boolean': {
                type: 'boolean',
                regex: /^(false|true)$/,
            },
            'null': {
                type: 'null',
                regex: /^null$/,
            },
            'quotationString': {
                type: 'string',
                bounding: '',
                regex: /^"[^"\\]*"$/,
            },
            'apostopheString': {
                type: 'string',
                regex: /^'[^'\\]*'$/,
            },
            'number': {
                type: 'number',
                regex: /^[0-9]+(.[0-9]+)?$/,
            },
            'singleLineComment': {
                type: 'comment',
                regex: /^\/\/[^\n\r]+$/,
            },
            'multiLineComment': {
                type: 'comment',
                regex: /^\/\*(\*\/)*\*\/$/,
            },
        }

        this.operators = {
            '=': { type: 'operator', },
            '+': { type: 'operator', },
            '-': { type: 'operator', },
            '/': { type: 'operator', },
            '*': { type: 'operator', },
            '==': { type: 'comparator', },
            '>': { type: 'comparator', },
            '<': { type: 'comparator', },
            '>=': { type: 'comparator', },
            '<=': { type: 'comparator', },
            '!=': { type: 'comparator', },
            '&&': { type: 'comparator', },
            '||': { type: 'comparator', },
        }

        this.keywords = {
            'let': { type: 'identifier', },
            'var': { type: 'identifier', },
            'const': { type: 'identifier', },
            'if': { type: 'keyword', },
            'else': { type: 'keyword', },
            'for': { type: 'keyword', },
            'do': { type: 'keyword', },
            'while': { type: 'keyword', },
            'function': { type: 'keyword', },
            'return': { type: 'keyword', },
            'class': { type: 'keyword', },
        }

        this.litteralMatches = [
            /^"[^"\\]*$/,
            /^'[^'\\]*$/,
        ]

        this.espaceTokens = {
            ';': 0,
            '.': 0,
        }

        this.espaceChars = {
            '\n': 0,
            '\t': 0,
        }

        this.whiteSpaces = {
            ' ': 0,
        }
    }

    highlight(container, code) {
        console.log('======= Parsing =======');
        this.container = container;
        container.innerHTML = '';

        this.tokens = [];
        let currentToken = { value: '', type: ''};
        let char = '';

        console.log(JSON.stringify(code));

        const addToken = () => {
            currentToken.type = this.__handleToken(currentToken.value);
            if (currentToken.type !== null) this.__addToken(currentToken.value, currentToken.type);
            currentToken.value = '';
            currentToken.type = '';
        }

        for (let i = 0; i < code.length; i++) {
            char = code[i];

            currentToken.value += char;

            let isInLitteral = this.__isInLitteral(currentToken.value);

            if (char in this.espaceChars) {
                addToken();
                container.innerHTML += char;
            } else if (!isInLitteral) {
                if (char in this.whiteSpaces) {
                    addToken();
                    container.innerHTML += char;
                } else if (char in this.punctuations && !(char == '.' && this.__isInteger(currentToken.value))) {
                    addToken();
                    this.__addToken(char, this.__handleToken(char));
                } else if (char in this.operators) {
                    addToken();
                    currentToken.value += char;
                }
            }

            currentToken.value += char;
            if (i == code.length - 1) {
                addToken();
            }

            // if (char in this.espaceChars) {
            //     addToken();
            //     container.innerHTML += char;
            // } else if (!isInLitteral && char in this.whiteSpaces) {
            //     addToken();
            //     container.innerHTML += char;
            // } else if (!isInLitteral && char in this.punctuations && !(char == '.' && this.__isInteger(currentToken))) {
            //     addToken();
            //     let escapeTokenType = this.__handleToken(char);
            //     this.__addToken(char, escapeTokenType);
            // } else {
            //     currentToken += char;

            //     if (i == code.length - 1) {
            //         addToken();
            //     }
            // }
        }
        console.log(this.tokens);
    }

    __isInLitteral(token) {
        return this.litteralMatches.some(l => token.match(l));
    }

    __isInteger(token) {
        return token.match(/(?![0-9])[0-9]*/);
    }

    __handleToken(token) {
        if (token.length <= 0) return null;

        let type = '';
        if (token in this.keywords)
            type = this.keywords[token].type;
        else if (token in this.punctuations)
            type = this.punctuations[token].type;
        else if (token in this.operators)
            type = this.punctuations[token].type;

        for (const l in this.literals) {
            if (token.match(this.literals[l].regex))
                type = this.literals[l].type;
        }

        this.tokens.push({ type: type, value: token });

        return type;
    }

    __addToken(token, type) {
        let tag = `<span class="token ${type}">${token}</span>`;
        this.container.innerHTML += tag;
    }
}