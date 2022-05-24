import { APP, createElement, addEventListener } from "../main.js";
import { CodeParser } from "../codeParser.js";

// ================================= Code Editor ==========================================
class CodeEditor {
    constructor(codeParser) {
        this.codeParser = codeParser;

        this.codeInput = document.getElementById("code-area-input");
        this.codeArea = document.getElementById("code-area");
        this.codeAreaContent = document.getElementById("code-area-content");
        this.lineNumbers = document.getElementById("code-line-number");

        this.codeInput.addEventListener('input', (event) => this.updateSyntaxHighlight(event.target.value));
        this.codeInput.addEventListener('scroll', (event) => this.syncScroll(event.target));
        this.codeInput.addEventListener('keydown', (event) => this.handleKeyInput(event));

        this.setDoc();

        this.isFirstUpdate = true;
        APP.addGameDataListener(gameData => {
            this.codeInput.value = gameData.gameCode;
            this.updateSyntaxHighlight(gameData.gameCode);
        });

        this.typingTimer;
        this.doneTypingInterval = 500;

        this.codeInput.addEventListener('keyup', () => {
            clearTimeout(this.typingTimer);
            if (this.codeInput.value) {
                this.typingTimer = setTimeout(() => this.updateCode(this.codeInput.value), this.doneTypingInterval);
            }
        });
    }

    updateCode(code) {
        APP.setGameCode(code);
    }

    updateSyntaxHighlight(code) {
        let tokens = this.codeParser.parseTokens(code);
        this.codeAreaContent.innerHTML = this.codeParser.generateHtml(tokens);
        this.setLineNumbers(code);
    }

    syncScroll(element) {
        this.codeArea.scrollTop = element.scrollTop;
        this.codeArea.scrollLeft = element.scrollLeft;
        this.lineNumbers.scrollTop = element.scrollTop;
    }

    insert(str, index) {
        let txt = this.codeInput.innerHTML;
        txt = txt.slice(0, index) + str + txt.slice(index);
        this.codeInput.innerHTML = txt;
        this.updateSyntaxHighlight(txt);
    }

    setLineNumbers(code) {
        this.lineNumbers.innerHTML = '';
        let textLines = code.split("\n");
        for (let i = 0; i < textLines.length; i++) {
            this.lineNumbers.innerHTML += '<span>' + i + '</span>';
        }
    }

    handleKeyInput(event) {
        let key = event.key;
        let e = event.target;
        let cursor_pos = e.selectionEnd + 1;

        function insert(str) {
            e.value = e.value.slice(0, e.selectionStart) + str + e.value.slice(e.selectionEnd, e.value.length);
        }

        function wrap(str1, str2, index = e.selectionStart) {
            e.value = e.value.slice(0, e.selectionStart) + str1 + e.value.slice(e.selectionStart, e.selectionEnd) + str2 + e.value.slice(e.selectionEnd, e.value.length);
        }

        if (key == "Tab") {
            event.preventDefault();
            if (event.shiftKey) {

            } else {
                insert('\t');
                e.selectionStart = cursor_pos;
                e.selectionEnd = cursor_pos;
                this.updateSyntaxHighlight(e.value);
            }
        }

        let chars = { '(': ')', '{': '}', '[': ']' }
        if (key in chars) {
            event.preventDefault();
            wrap(key, chars[key]);
            e.selectionStart = cursor_pos;
            e.selectionEnd = cursor_pos;
            this.updateSyntaxHighlight(e.value);
        }
    }

    setDoc() {
        this.codeDoc = document.getElementById("code-doc");
        this.codeDocList = [];

        for (let [key, value] of Object.entries(APP.context)) {
            let div = document.createElement('div');
            div.className = 'code-doc-entry';

            let label = document.createElement('h6');
            label.innerHTML = key;
            div.appendChild(label);

            let description = document.createElement('p');
            description.innerHTML = value.description;
            div.appendChild(description);

            if (typeof (value.f) == 'function') {
                let functionStr = value.f.toString();
                let i = functionStr.indexOf(')');
                let args = functionStr.substring(0, i + 1);
                args = args.replace('obj = ', '');
                args = args.replace('(', '<span>(</span>');
                args = args.replace(')', '<span>)</span>');
                args = args.replace('{', '<span>{</span>');
                args = args.replace('}', '<span>}</span>');

                if (args.length > 0)
                    label.innerHTML += args;
            } else if (value.type == 'value') {

            }

            this.codeDocList.push(div);
            this.codeDoc.appendChild(div);
        }

        addEventListener('code-doc-btn', 'click', () => this.codeDoc.classList.add('active'));
        addEventListener('code-doc-btn-close', 'click', () => this.codeDoc.classList.remove('active'));
    }
}

const codeParser = new CodeParser();
const codeEditor = new CodeEditor(codeParser);