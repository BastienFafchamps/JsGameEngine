export class CodeParser {
    constructor() {
        this.TOKENS = [
            { regex: /"[^"\\]*"/, key: 'string_0', tags: ['string'] },
            { regex: /'[^'\\]*'/, key: 'string_1', tags: ['string'] },
            { regex: /\s+/, key: 'whitespace', tags: ['whitespace'] },
            { regex: /(false|true)/, key: 'boolean', tags: ['boolean'] },
            { regex: /[0-9]+(.[0-9]+)?/, key: 'number', tags: ['number'] },
            { regex: /\/\/[^\n\r]+/, key: 'comment_0', tags: ['comment'] },
            { regex: /\/\*(\*\/)*\*\//, key: 'comment_1', tags: ['comment'] },
            { regex: /\./, key: 'punctuation_dot', tags: ['punctuation', 'dot'] },
            { regex: /,/, key: 'punctuation_comma', tags: ['punctuation'] },
            { regex: /:/, key: 'punctuation_doubledot', tags: ['punctuation'] },
            { regex: /;/, key: 'punctuation_dotcomma', tags: ['punctuation'] },
            { regex: /!/, key: 'punctuation_exclamation', tags: ['punctuation'] },
            { regex: /\(/, key: 'separator_parentheseopen', tags: ['separator'] },
            { regex: /\)/, key: 'separator_parentheseclose', tags: ['separator'] },
            { regex: /\{/, key: 'separator_braceopen', tags: ['separator'] },
            { regex: /\}/, key: 'separator_braceclose', tags: ['separator'] },
            { regex: /\[/, key: 'separator_xopen', tags: ['separator'] },
            { regex: /\]/, key: 'separator_xclose', tags: ['separator'] },
            { regex: /let/, key: 'keyword_let', tags: ['keyword'] },
            { regex: /var/, key: 'keyword_var', tags: ['keyword'] },
            { regex: /const/, key: 'keyword_const', tags: ['keyword'] },
            { regex: /if/, key: 'keyword_if', tags: ['keyword'] },
            { regex: /else/, key: 'keyword_else', tags: ['keyword'] },
            { regex: /for/, key: 'keyword_for', tags: ['keyword'] },
            { regex: /do/, key: 'keyword_do', tags: ['keyword'] },
            { regex: /while/, key: 'keyword_while', tags: ['keyword'] },
            { regex: /function/, key: 'keyword_function', tags: ['keyword'] },
            { regex: /return/, key: 'keyword_return', tags: ['keyword'] },
            { regex: /class /, key: 'keyword_class', tags: ['keyword'] },
            { regex: /null/, key: 'keyword_null', tags: ['keyword'] },
            { regex: /\>\=/, key: 'comparator_greaterequals', tags: ['comparator'] },
            { regex: /\<\=/, key: 'comparator_smallerequals', tags: ['comparator'] },
            { regex: /\!=/, key: 'comparator_notequals', tags: ['comparator'] },
            { regex: /\&\&/, key: 'comparator_and', tags: ['comparator'] },
            { regex: /\|\|/, key: 'comparator_or', tags: ['comparator'] },
            { regex: /\=\=/, key: 'comparator_equals', tags: ['comparator'] },
            { regex: /\>/, key: 'comparator_greater', tags: ['comparator'] },
            { regex: /\</, key: 'comparator_smaller', tags: ['comparator'] },
            { regex: /=/, key: 'operator_equals', tags: ['operator'] },
            { regex: /\+/, key: 'operator_add', tags: ['operator'] },
            { regex: /_/, key: 'operator_minus', tags: ['operator'] },
            { regex: /\//, key: 'operator_divide', tags: ['operator'] },
            { regex: /\*/, key: 'operator_multiply', tags: ['operator'] },
            { regex: /[a-zA-Z_][a-zA-Z_0-9]*/, key: 'identifier', tags: ['identifier'] },
        ];

        this.RULES = [
            {
                key: 'identifier',
                previous: [],
                next: ['separator_parentheseopen'],
                result: 'function_call'
            },
            {
                key: 'identifier',
                previous: ['keyword_function'],
                next: ['separator_parentheseopen'],
                result: 'function',
                remove: ['function_call']
            },
            {
                key: 'identifier',
                previous: [],
                next: ['punctuation_doubledot'],
                result: 'object'
            }
        ]

        this.TRANSLATING_RULES = [
            {
                identifier: 'keyword_var',
                previous: [],
                next: ['separator_parentheseopen'],
                result: ''
            },
        ]

        let regex = this.__getFullRegex();
        this.matcher = new RegExp(regex, 'g');
    }

    parseTokens(code) {
        let matches = code.matchAll(this.matcher);
        let tokens_all = [];
        let tokens = [];

        for (const match of matches) {
            let groups = match.groups
            for (const key in groups) {
                if (groups[key] != null) {
                    let token ={
                        value: groups[key],
                        key: key,
                        tags: [...this.TOKENS_MAP[key].tags],
                    };

                    tokens_all.push(token);
                    if (key != 'whitespace')
                        tokens.push(token);
                    
                    break;
                }
            }
        }

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];

            this.RULES.forEach(rule => {
                if (token.key != rule.key)
                    return;

                for (let j = 0; j < rule.next.length && i + j + 1 < tokens.length; j++) {
                    if (tokens[i + j + 1].key != rule.next[j])
                        return;
                }

                for (let j = 0; j < rule.previous.length && i - j - 1 >= 0; j++) {
                    if (tokens[i - j - 1].key != rule.previous[j])
                        return;
                }
                token.tags.push(rule.result);

                if (rule.remove != null)
                    token.tags = token.tags.filter(tag => !rule.remove.includes(tag));
            });
        }

        return tokens_all;
    }

    translate(tokens) {
        let newTokens = [...tokens];
        newTokens.forEach(t => {
        });
        return newTokens.concat(t);
    }

    generateHtml(tokens) {
        console.log(tokens);
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

    __getFullRegex() {
        let regex = '';
        this.TOKENS_MAP = {};
        this.TOKENS.forEach((t, index) => {
            this.TOKENS_MAP[t.key] = t;
            if (index < this.TOKENS.length - 1) {
                regex += `(?<${t.key}>${t.regex.source})|`;
            } else
                regex += `(?<${t.key}>${t.regex.source})`;
        });
        return regex;
    }
}