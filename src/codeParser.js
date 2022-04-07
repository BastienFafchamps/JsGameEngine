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

    parseTokens(code) {
        this.tokens = [];
        let currentToken = { value: '', tags: [] };
        let char = '';

        const addToken = () => {
            currentToken.tags = this.__handleToken(currentToken.value);
            if (currentToken.tags !== null)
                this.__addToken(currentToken.value, currentToken.tags);
            currentToken.value = '';
            currentToken.tags = ['none'];
        }

        for (let i = 0; i < code.length; i++) {
            char = code[i];

            let isInLitteral = this.__isInLitteral(currentToken.value);

            if (this.espaceChars[char] == 0) {
                addToken();
                this.__addToken(char, ['whitespace']);
            } else if (!isInLitteral && this.whiteSpaces[char] == 0) {
                addToken();
                this.__addToken(char, ['whitespace']);
            } else if (!isInLitteral && this.punctuations[char] != null) {
                addToken();
                let escapeTokenType = this.__handleToken(char);
                this.__addToken(char, escapeTokenType);
            } else if (!isInLitteral && currentToken.tags[0] == 'none' && !this.__isAlphabetic(char)) {
                addToken();
                currentToken.value += char;
            } else {
                currentToken.value += char;
            }

            if (i == code.length - 1) {
                addToken();
            }
        }
        return this.tokens;
    }

    translate(tokens) {
        let newTokens = [...tokens];
        newTokens.forEach(t => {

        });
        return newTokens.concat(t );
    }

    generateHtml(tokens) {
        let htmlString = '';
        tokens.forEach(token => {
            if (token.tags[0] != 'whitespace')
                htmlString += `<span class="token ${token.tags.join(' ')}">${token.value}</span>`;
            else
                htmlString += token.value;
        });
        return htmlString;
    }

    // ######################################################################################
    // #                                  - PRIVATES -                                      #
    // ######################################################################################

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

    __isFunctionParam(token) {
        if (token.tags[0] != 'identifier') return false;

        
    }

    __handleToken(token) {
        if (token.length <= 0) return null;

        let tags = ['none'];
        if (token in this.keywords)
            tags = [this.keywords[token].type];
        else if (token in this.punctuations)
            tags = [this.punctuations[token].type];
        else if (token in this.operators)
            tags = [this.operators[token].type];

        for (const l in this.literals) {
            if (token.match(this.literals[l].regex))
                tags = [this.literals[l].type];
        }

        if (tags[0] == 'none') {
            if (this.__isUpperAlphabetic(token))
                tags = ['identifier', 'upper'];
            else if (this.__isAlphabetic(token))
                tags = ['identifier'];
        }

        if (tags[0] == 'identifier' && this.tokens.length >= 2) {
            let i = this.tokens.length - 1;
            if (this.tokens[i].value == '.' && this.tokens[i - 1].tags[0] == 'identifier') {
                tags.push('sub-identifier');
            }
        }

        return tags;
    }

    __addToken(token, tags) {
        // If last token was a whitespace, concatenate token it.
        if (tags[0] == 'whitespace' && this.tokens.length >= 1 && this.tokens[this.tokens.length - 1].tags[0] == 'whitespace')
            this.tokens[this.tokens.length - 1].value += token;
        else
            this.tokens.push({ tags: tags, value: token });
    }
}