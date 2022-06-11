export class CodeParser {
    constructor() {
        this.TOKENS = [
            { regex: /"[^"\\]*"/, type: 'string_0', tags: ['string'] },
            { regex: /'[^'\\]*'/, type: 'string_1', tags: ['string'] },
            { regex: /\s+/, type: 'whitespace', tags: ['whitespace'] },
            { regex: /(false|true)/, type: 'boolean', tags: ['boolean']},
            { regex: /[0-9]+(.[0-9]+)?/, type: 'number', tags: ['number'] },
            { regex: /\/\/[^\n\r]+/, type: 'comment_0', tags: ['comment'] },
            { regex: /\/\*(\*\/)*\*\//, type: 'comment_1', tags: ['comment'] },
            { regex: /\./, type: 'punctuation_dot', tags: ['punctuation', 'dot'] },
            { regex: /,/, type: 'punctuation_comma', tags: ['punctuation'] },
            { regex: /:/, type: 'punctuation_doubledot', tags: ['punctuation'] },
            { regex: /;/, type: 'punctuation_dotcomma', tags: ['punctuation'] },
            { regex: /!/, type: 'punctuation_exclamation', tags: ['punctuation'] },
            { regex: /\(/, type: 'separator_parentheseopen', tags: ['separator'] },
            { regex: /\)/, type: 'separator_parentheseclose', tags: ['separator'] },
            { regex: /\{/, type: 'separator_braceopen', tags: ['separator'] },
            { regex: /\}/, type: 'separator_braceclose', tags: ['separator'] },
            { regex: /\[/, type: 'separator_xopen', tags: ['separator'] },
            { regex: /\]/, type: 'separator_xclose', tags: ['separator'] },
            { regex: /let/, type: 'keyword_let', tags: ['keyword'] },
            { regex: /var/, type: 'keyword_var', tags: ['keyword'] },
            { regex: /const/, type: 'keyword_const', tags: ['keyword'] },
            { regex: /if/, type: 'keyword_if', tags: ['keyword'] },
            { regex: /else/, type: 'keyword_else', tags: ['keyword'] },
            { regex: /for/, type: 'keyword_for', tags: ['keyword'] },
            { regex: /do/, type: 'keyword_do', tags: ['keyword'] },
            { regex: /while/, type: 'keyword_while', tags: ['keyword'] },
            { regex: /function/, type: 'keyword_function', tags: ['keyword'] },
            { regex: /return/, type: 'keyword_return', tags: ['keyword'] },
            { regex: /class /, type: 'keyword_class', tags: ['keyword'] },
            { regex: /null/, type: 'keyword_null', tags: ['keyword'] },
            { regex: /\>\=/, type: 'comparator_greaterequals', tags: ['comparator'] },
            { regex: /\<\=/, type: 'comparator_smallerequals', tags: ['comparator']},
            { regex: /\!=/, type: 'comparator_notequals', tags: ['comparator'] },
            { regex: /\&\&/, type: 'comparator_and', tags: ['comparator'] },
            { regex: /\|\|/, type: 'comparator_or', tags: ['comparator'] },
            { regex: /\=\=/, type: 'comparator_equals', tags: ['comparator'] },
            { regex: /\>/, type: 'comparator_greater', tags: ['comparator'] },
            { regex: /\</, type: 'comparator_smaller', tags: ['comparator'] },
            { regex: /=/, type: 'operator_equals', tags: ['operator'] },
            { regex: /\+/, type: 'operator_add', tags: ['operator'] },
            { regex: /_/, type: 'operator_minus', tags: ['operator'] },
            { regex: /\//, type: 'operator_divide', tags: ['operator'] },
            { regex: /\*/, type: 'operator_multiply', tags: ['operator'] },
            { regex: /[a-zA-Z_][a-zA-Z_0-9]*/, type: 'identifier', tags: ['identifier'] },
        ];

        let regex = this.__getFullRegex();
        this.matcher = new RegExp(regex, 'g');
    }

    parseTokens(code) {
        let matches = code.matchAll(this.matcher);
        let results = [];

        for (const match of matches) {
            let groups = match.groups
            for (const key in groups) {
                if (groups[key] != null)
                {
                    results.push({
                        'value': groups[key],
                        'identifier': key,
                        'tags': this.TOKENS_MAP[key].tags,
                    });
                    break;
                }
            }
        }
        return results;
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
            this.TOKENS_MAP[t.type] = t;
            if (index < this.TOKENS.length - 1) {
                regex += `(?<${t.type}>${t.regex.source})|`;
            } else
                regex += `(?<${t.type}>${t.regex.source})`;
        });
        return regex;
    }
}