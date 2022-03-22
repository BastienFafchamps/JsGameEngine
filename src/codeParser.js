export class CodeParser {
    constructor() {
        this.punctuations = {
            '.': { type: 'punctuation', },
            ':': { type: 'punctuation', },
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
            'let': { type: 'keyword', },
            'var': { type: 'keyword', },
            'const': { type: 'keyword', },
            'if': { type: 'keyword', },
            'else': { type: 'keyword', },
            'for': { type: 'keyword', },
            'do': { type: 'keyword', },
            'while': { type: 'keyword', },
            'function': { type: 'keyword', },
            'return': { type: 'keyword', },
            'class': { type: 'keyword', },
            'null': { type: 'keyword', },
        }

        this.litteralMatches = [
            /^"[^"\\]*$/,
            /^'[^'\\]*$/,
            /^\/\/(?!\n)$/,
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
        this.container = container;
        container.innerHTML = '';

        this.tokens = [];
        let currentToken = { value: '', type: '' };
        let char = '';

        const addToken = () => {
            currentToken.type = this.__handleToken(currentToken.value);
            if (currentToken.type !== null) 
                this.__addToken(currentToken.value, currentToken.type);
            currentToken.value = '';
            currentToken.type = 'none';
        }

        for (let i = 0; i < code.length; i++) {
            char = code[i];

            let isInLitteral = this.__isInLitteral(currentToken.value);

            if (char in this.espaceChars) {
                addToken();
                container.innerHTML += char;
            } else if (!isInLitteral && char in this.whiteSpaces) {
                addToken();
                container.innerHTML += char;
            } else if (!isInLitteral && char in this.punctuations) {
                addToken();
                let escapeTokenType = this.__handleToken(char);
                this.__addToken(char, escapeTokenType);
            } else if (!isInLitteral && currentToken.type == 'none' && !this.__isAlphabetic(char)) {
                addToken();
                currentToken.value += char;
            } else {
                currentToken.value += char;
            }

            if (i == code.length - 1) {
                addToken();
            }
        }
        console.log(this.tokens);
        // this.tokens[this.tokens.length - 1].el.classList.add("error");
    }

    __isInLitteral(token) {
        return this.litteralMatches.some(l => token.match(l));
    }

    __isInteger(token) {
        return token.match(/(?![0-9])[0-9]*/) != null;
    }

    __isAlphabetic(token) {
        return token.match(/[a-zA-Z_]/) != null;
    }

    __isUpperAlphabetic(token) {
        return token.match(/[A-Z_]/) != null;
    }

    __matchLitteral(token) {
        for (const l in this.literals) {
            if (token.match(this.literals[l].regex))
                return this.literals[l].type;
        }
        return null;
    }

    __tokenType(token) {
        if (token.length <= 0) return null;

        let type = 'none';
        if (token in this.keywords)
            type = this.keywords[token].type;
        else if (token in this.punctuations)
            type = this.punctuations[token].type;
        else if (token in this.operators)
            type = this.operators[token].type;

        for (const l in this.literals) {
            if (token.match(this.literals[l].regex))
                type = this.literals[l].type;
        }

        if (type == 'none') {
            if (this.__isUpperAlphabetic(token))
                type = 'identifier upper';
            else if (this.__isAlphabetic(token))
                type = 'identifier';
        }

        return type;
    }

    __handleToken(token) {
        if (token.length <= 0) return null;
        let type = this.__tokenType(token);
        return type;
    }

    __addToken(token, type) {
        let tag = document.createElement('span');
        tag.className = `token ${type}`;
        tag.innerHTML = token;

        this.container.appendChild(tag);
        this.tokens.push({ type: type, value: token, el: tag });
    }
}