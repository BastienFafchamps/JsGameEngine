import { settings } from "./c_main.js";

// ==================================== TABS =============================================
const tabPanels = document.getElementsByClassName("tab-panel");
const tabButtons = document.getElementsByClassName("tab-btn");
let activeTab = 0;

function openTab(button, id) {
    for (let i = 0; i < tabPanels.length; i++) {
        tabPanels[i].style.display = "none";
        tabButtons[i].classList.remove("active");
    }
    activeTab = [...tabPanels].findIndex(t => t.id == id);
    document.getElementById(id).style.display = "flex";
    button.classList.add("active");
}

for (let i = 0; i < tabPanels.length; i++)
    tabButtons[i].addEventListener('click', event => openTab(event.currentTarget, tabPanels[i].id));
openTab(tabButtons[activeTab], tabPanels[activeTab].id);

// ================================= Code Editor ==========================================
const codeInput = document.getElementById("code-area-input");
const codeArea = document.getElementById("code-area");
const codeAreaContent = document.getElementById("code-area-content");

function update(text) {
    let code = text;
    if (text[text.length - 1] == "\n") {
        text += " ";
    }
    codeAreaContent.innerHTML = text.replace("&", "&amp;").replace("<", "&lt;");
    Prism.highlightElement(codeAreaContent);
    sessionStorage.setItem('code', text);
    run(code);
}
function syncScroll(element) {
    codeArea.scrollTop = element.scrollTop;
    codeArea.scrollLeft = element.scrollLeft;
}
function checkTab(e, event) {
    if (event.key == "Tab") {
        event.preventDefault();
        if (event.shiftKey) {

        } else {
            let cursor_pos = e.selectionEnd + 1;
            e.value = e.value.slice(0, e.selectionStart) + "\t" + e.value.slice(e.selectionEnd, e.value.length);
            e.selectionStart = cursor_pos;
            e.selectionEnd = cursor_pos;
            update(e.value);
        }
    }
}
codeInput.addEventListener('input', (event) => update(event.target.value));
codeInput.addEventListener('scroll', (event) => syncScroll(event.target));
codeInput.addEventListener('keydown', (event) => checkTab(event.target, event));

let sessionCode = sessionStorage.getItem('code');
if (sessionCode != null && sessionCode.length > 0) {
    codeInput.innerHTML = sessionCode;
    update(sessionCode);
}

// ================================= File ==========================================
function download() {
    let filename = 'game.txt';
    let file = new Blob([codeInput.innerHTML], { type: 'txt' });
    if (window.navigator.msSaveOrOpenBlob)
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        let a = document.createElement('a');
        let url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
document.getElementById('download').addEventListener('click', () => download());

function onFileLoad(event) {
    let reader = new FileReader();
    reader.readAsText(event.target.files[0], 'UTF-8');
    reader.onload = readerEvent => {
        codeInput.innerHTML = readerEvent.target.result;
        update(readerEvent.target.result);
    }
}
const loadFileBtn = document.getElementById('load');
loadFileBtn.type = 'file';
loadFileBtn.addEventListener('change', event => onFileLoad(event));

// ================================= Settings ==========================================

const settingsEditor = document.getElementById('settings-editor');

let settingsTemplate = {
    color: '',
};
// let settingsTemplate = {
//     "text": 'value',
//     "numberAndTest": 0.5,
//     "detailed_&t": {
//         "label": 'Detailed Int',
//         "type": 'int',
//         "min": 0,
//         "max": 10,
//     },
//     "obj": {
//         "prop_1": 0,
//         "prop_2": 0,
//     },
// }

// let settingsObj = {
//     "text": '',
//     "number": 0,
//     "detailed": 0,
//     "obj": {
//         "prop_1": 0,
//         "prop_2": 0,
//     },
// }

function getFieldsEditor(objKey, template, obj, onChange) {
    const inputTypes = { 'number': 'number', 'int': 'number', 'float': 'number', 'string': 'text', 'boolean': 'checkbox' };

    function capitalize(string) {
        string = string.replace(/([A-Z])/g, ' $1').trim();
        string = string.replace('_', ' ');
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function createInput(name, type) {
        let input = document.createElement('input');
        input.classList.add('object-editor-input');
        input.name = name;
        input.type = type;
        return input;
    }

    function createLabel(name) {
        let label = document.createElement('label');
        label.classList.add('object-editor-label');
        label.innerHTML = capitalize(name);
        label.for = name;
        return label;
    }

    function addListener(input, key, obj, validation) {
        input.addEventListener('change', e => {
            obj[key] = validate(e.target.value, validation);
            input.value = obj[key];
            onChange();
        });
    }

    function validate(value, validation) {
        if (validation.type == 'number' || validation.type == 'int' || validation.type == 'float') {
            return validateNumber(value, validation);
        } else {
            return value;
        }
    }

    function validateNumber(value, validation) {
        if (validation.type == 'int') {
            value = parseInt(value);
        } else if (validation.type == 'float') {
            value = parseFloat(value);
        }
        if (value > validation.max)
            value = validation.max;
        if (value < validation.min)
            value = validation.min;
        return value;
    }

    let container = document.createElement('div');
    container.classList.add('object-editor-container');

    for (const [key, templateData] of Object.entries(template)) {
        let input = null;
        let label = null;
        if (key.endsWith('_&t')) {
            label = templateData.label != null ? createLabel(templateData.label) : createLabel(key);
            input = createInput(objKey, inputTypes[templateData.type], templateData);
            addListener(input, key.replace('_&t', ''), obj, templateData);
            input.value = obj[key.replace('_&t', '')];
        } else if (typeof templateData === 'object') {
            label = createLabel(key);
            label.classList.add('object-editor-collapsible');
            input = getFieldsEditor(key, templateData, obj[key]);

            label.addEventListener('click', () => {
                if (input.style.maxHeight != '0px') {
                    label.classList.remove('active');
                    input.style.maxHeight = '0px';
                } else {
                    label.classList.add('active');
                    input.style.maxHeight = input.scrollHeight + "px";
                }
            });
            input.style.maxHeight = "0px";
        } else {
            label = createLabel(key);
            input = createInput(key, inputTypes[typeof templateData]);
            input.value = obj[key];
            addListener(input, key, obj, templateData);
        }
        container.appendChild(label);
        container.appendChild(input);
    }
    return container;
}

// settings = JSON.parse(sessionStorage.getItem('settings'));
settingsEditor.appendChild(getFieldsEditor('settings', settingsTemplate, settings, () => {
    sessionStorage.setItem('settings', JSON.stringify(settings));
}));

// ================================= Short Cuts ==========================================
document.addEventListener('keypress', (event) => {
    if (event.shiftKey && event.key == 'A') {
        activeTab = (activeTab + 1) % tabPanels.length;
        openTab(tabButtons[activeTab], tabPanels[activeTab].id);
    }
});