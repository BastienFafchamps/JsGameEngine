import { App } from "./c_main.js";
import { HtmlSynth } from "./c_engine.js";

function addEventListener(id, type, method) {
    document.getElementById(id).addEventListener(type, method);
}

const CANVAS = document.getElementById("main-canvas");
const canvasContainer = document.getElementById("game-view");

window.onresize = () => {
    if (canvasContainer == null || CANVAS == null) return;
    CANVAS.width = canvasContainer.clientWidth;
    CANVAS.height = canvasContainer.clientHeight;
}

const app = new App(CANVAS);
app.onGameDataUpdate = (gameData) => sessionStorage.setItem('gameData', JSON.stringify(gameData));

document.getElementById("btn-reload").addEventListener('click', () => app.run());

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
    sessionStorage.setItem("activeTab", activeTab);
}

for (let i = 0; i < tabPanels.length; i++)
    tabButtons[i].addEventListener('click', event => openTab(event.currentTarget, tabPanels[i].id));

if (sessionStorage.getItem('activeTab'))
    activeTab = sessionStorage.getItem('activeTab')
openTab(tabButtons[activeTab], tabPanels[activeTab].id);


// ================================= Main ==========================================
function downloadLink(filename, url) {
    let a = document.createElement('a');
    a.download = filename;
    a.href = url;

    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function download() {
    let filename = 'game.json';
    let file = new Blob([JSON.stringify(app.GameData)], { type: 'json' });
    if (window.navigator.msSaveOrOpenBlob)
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        let url = URL.createObjectURL(file);
        downloadLink(filename, url);
    }
}
document.getElementById('download').addEventListener('click', () => download());

function onFileLoaded(event) {
    let reader = new FileReader();
    reader.readAsText(event.target.files[0], 'UTF-8');
    reader.onload = readerEvent => {
        let gameData = JSON.parse(readerEvent.target.result);
        app.loadGameData(gameData);
        codeInput.innerHTML = gameData.gameCode;
        updateCode(gameData.gameCode);
    }
}
document.getElementById('load').addEventListener('change', event => onFileLoaded(event));

// ================================= Code Editor ==========================================
const codeInput = document.getElementById("code-area-input");
const codeArea = document.getElementById("code-area");
const codeAreaContent = document.getElementById("code-area-content");

function loadCode(code) {
    codeInput.innerText = code;
    updateCode(code);
}

function updateCode(text) {
    if (text[text.length - 1] == "\n") {
        text += " ";
    }
    codeAreaContent.innerHTML = text.replace("&", "&amp;").replace("<", "&lt;");
    Prism.highlightElement(codeAreaContent);
    app.setGameCode(text);
}

function syncScroll(element) {
    codeArea.scrollTop = element.scrollTop;
    codeArea.scrollLeft = element.scrollLeft;
}

function checkTab(e, event) {
    if (event.ctrlKey && event.key == "Z") {
        updateCode(e.value);
    }
    if (event.key == "Tab") {
        event.preventDefault();
        if (event.shiftKey) {

        } else {
            let cursor_pos = e.selectionEnd + 1;
            e.value = e.value.slice(0, e.selectionStart) + "\t" + e.value.slice(e.selectionEnd, e.value.length);
            e.selectionStart = cursor_pos;
            e.selectionEnd = cursor_pos;
            updateCode(e.value);
        }
    }
}

codeInput.addEventListener('input', (event) => updateCode(event.target.value));
codeInput.addEventListener('scroll', (event) => syncScroll(event.target));
codeInput.addEventListener('keydown', (event) => checkTab(event.target, event));

// ================================= Settings ==========================================

function capitalize(string) {
    string = string.replace(/([A-Z])/g, ' $1').trim();
    string = string.replace('_', ' ');
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getFieldsEditor(objKey, template, obj, onChange) {
    const inputTypes = { 'number': 'number', 'int': 'number', 'float': 'number', 'string': 'text', 'boolean': 'checkbox' };

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
            console.log(obj);
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

const settingsEditor = document.getElementById('settings-editor');

settingsEditor.appendChild(getFieldsEditor('settings', app.GameData.settings, app.GameData.settings, () => {
    console.log('changed', app.GameData);
    app.updatedGameData();
}));

try {
    let gameData = JSON.parse(sessionStorage.getItem('gameData'));
    if (gameData != null) {
        app.loadGameData(gameData);
        loadCode(gameData.gameCode);
    }
} catch (error) {
    console.warn('Error trying to load session gameData');
}

// ================================= Sprite Editor ==========================================

const spriteEditorCanvas = document.getElementById('sprite-editor-canvas');
const spriteEditorCtx = spriteEditorCanvas.getContext('2d');

function setPixel(x, y, rgba) {
    let imgData = spriteEditorCtx.createImageData(1, 1);
    let d = imgData.data;
    d[0] = rgba[0];
    d[1] = rgba[1];
    d[2] = rgba[2];
    d[3] = rgba[3];
    spriteEditorCtx.putImageData(imgData, x, y);
}

function getPixel(x, y) {
    let data = spriteEditorCtx.getImageData(x, y, 1, 1).data;
    return [data[0], data[1], data[2], data[3]];
}

function drawImage(x, y, image) {
    spriteEditorCtx.drawImage(image, x, y);
}

function clearSpriteEditor() {
    spriteEditorCtx.clearRect(0, 0, spriteEditorCanvas.width, spriteEditorCanvas.height);
}

const spriteEditorGrid = document.getElementById('sprite-editor-grid');
function setSpriteEditor(spriteSize) {
    spriteEditorCanvas.width = spriteSize;
    spriteEditorCanvas.height = spriteSize;
    spriteEditorGrid.style.gridTemplateColumns = `repeat(${spriteSize}, 1fr)`;
    spriteEditorGrid.style.gridTemplateRows = `repeat(${spriteSize}, 1fr)`;
    for (let x = 0; x < spriteSize; x++) {
        for (let y = 0; y < spriteSize; y++) {
            let cell = document.createElement('div');
            cell.className = 'sprite-editor-cell';
            spriteEditorGrid.appendChild(cell);
        }
    }
}
setSpriteEditor(16);

const spriteEditorTool = {
    type: 'pencil',
    canMove: true,
    color: [0, 0, 0, 255],
};

// --------------- Color Picker ---------------
const spriteEditorColorPicker = document.getElementById('sprite-editor-color-picker');
const spriteEditorColorPickerLabel = document.getElementById('sprite-editor-color-picker-label');

spriteEditorColorPicker.value = '#000000';
spriteEditorColorPickerLabel.style.background = '#000000';

spriteEditorColorPicker.addEventListener("input", (event) => {
    let inputColor = event.target.value;
    let bigint = parseInt(inputColor.substring(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    spriteEditorTool.color = [r, g, b, 255];
    spriteEditorColorPickerLabel.style.background = inputColor;
});
// ---------------------------------------------

function handleClick(event) {
    let rect = spriteEditorCanvas.getBoundingClientRect();
    let scaleFactor = rect.width / spriteEditorCanvas.width;
    let x = Math.floor((event.clientX - rect.left) / scaleFactor);
    let y = Math.floor((event.clientY - rect.top) / scaleFactor);

    if (spriteEditorTool.type == 'pencil')
        setPixel(x, y, spriteEditorTool.color);
    else if (spriteEditorTool.type == 'eraser')
        setPixel(x, y, [0, 0, 0, 0]);
    else if (spriteEditorTool.type == 'bucket') {
        let oldColor = getPixel(x, y);
        if (areColorEquals(oldColor, spriteEditorTool.color)) return;

        floodFill(x, y, oldColor, spriteEditorTool.color);
        function floodFill(x, y, oldColor, newColor) {
            if (x < 0 || y < 0 || x >= spriteEditorCanvas.width || y >= spriteEditorCanvas.width) return;
            if (areColorEquals(getPixel(x, y), newColor)) return;
            if (!areColorSimilar(getPixel(x, y), oldColor)) return;

            setPixel(x, y, newColor);
            floodFill(x + 1, y, oldColor, newColor);  // then i can either go south
            floodFill(x - 1, y, oldColor, newColor);  // or north
            floodFill(x, y + 1, oldColor, newColor);  // or east
            floodFill(x, y - 1, oldColor, newColor);  // or west
            return;
        }

        function areColorEquals(a, b) {
            return a.length === b.length && a.every((value, index) => value === b[index]);
        }

        function areColorSimilar(a, b) {
            return a.length === b.length && a.every((value, index) => value === b[index]);
        }
    }
}

let spriteEditor_isMouseDown = false;
spriteEditorCanvas.addEventListener("mousedown", (e) => {
    spriteEditor_isMouseDown = true;
    if (!spriteEditorTool.canMove)
        handleClick(e);
});
spriteEditorCanvas.addEventListener("mouseup", () => spriteEditor_isMouseDown = false);
spriteEditorCanvas.addEventListener("mousemove", (e) => {
    if (spriteEditor_isMouseDown && spriteEditorTool.canMove)
        handleClick(e);
});

function setSelectedTool(tool) {
    let tools = document.getElementsByClassName('sprite-editor-tool');
    for (let i = 0; i < tools.length; i++) {
        tools[i].classList.remove('active');
    }
    document.getElementById('sprite-editor-' + tool).classList.add('active');
}
setSelectedTool('pencil');

document.getElementById('sprite-editor-pencil').addEventListener('click', () => {
    spriteEditorTool.type = 'pencil';
    spriteEditorTool.canMove = true;
    setSelectedTool(spriteEditorTool.type);
});
document.getElementById('sprite-editor-eraser').addEventListener('click', () => {
    spriteEditorTool.type = 'eraser';
    spriteEditorTool.canMove = true;
    setSelectedTool(spriteEditorTool.type);
});
document.getElementById('sprite-editor-bucket').addEventListener('click', () => {
    spriteEditorTool.type = 'bucket';
    spriteEditorTool.canMove = false;
    setSelectedTool(spriteEditorTool.type);
});

document.getElementById('sprite-editor-download').addEventListener('click', () => {
    downloadLink('sprite.png', spriteEditorCanvas.toDataURL("image/png"));
});

document.getElementById('sprite-editor-load').addEventListener('change', event => {
    let image = new Image();
    image.onload = () => {
        clearSpriteEditor();
        drawImage(0, 0, image);
        URL.revokeObjectURL(image.src);
    }
    image.src = URL.createObjectURL(event.target.files[0]);
    event.target.value = '';
}, false);

// ================================= Audio ==========================================
const synth = new HtmlSynth();

const WAVE_FORMS = [
    'sine',
    'square',
    'sawtooth',
    'triangle',
]

const FREQUENCIES = {
    'C': 16.35,
    'C#': 17.32,
    'D': 18.35,
    'Eb': 19.45,
    'E': 20.60,
    'F': 21.83,
    'F#': 23.12,
    'G': 24.50,
    'G#': 25.96,
    'A': 27.50,
    'Bb': 29.14,
    'B': 30.87,
}

const audioCtx = new AudioContext();
// const audioCtx = new (AudioContext || webkitAudioContext)();

const mainGainNode = audioCtx.createGain();
mainGainNode.gain.value = 0.2;
mainGainNode.connect(audioCtx.destination);

const eveloppeMaxTime = 1;

let playingNotes = {};

let selectedWaveForm = 0;

let octave = 4;
let _octave = 4;


let instrument = {
    waveForm: 'sine',
    enveloppe: {
        'attack': 0.01,
        'decay': 0.1,
        'sustain': 0,
        'release': 0.5,
    }
};

function setOctave(newOctave) {
    octave = Math.min(Math.max(0, newOctave), 25);
    document.getElementById('audio-octave').innerHTML = 'Octave: ' + octave;
}

function setWaveForm(newWaveForm) {
    selectedWaveForm = Math.min(Math.max(0, newWaveForm), WAVE_FORMS.length - 1);
    let s = WAVE_FORMS[selectedWaveForm];
    instrument.waveForm = WAVE_FORMS[selectedWaveForm];
    document.getElementById('audio-type').innerHTML = s.charAt(0).toUpperCase() + s.slice(1);
}

function playNote(note) {
    synth.playNote(instrument, octave, note);
    return;

    if (playingNotes[note] != null) {
        // if (playingNotes[note].osc != null)
        //     playingNotes[note].osc.stop();
        if (playingNotes[note].gainNode != null)
            playingNotes[note].gainNode.gain.cancelScheduledValues(0);
    }

    let gainNode = audioCtx.createGain();
    gainNode.connect(mainGainNode);

    let osc = audioCtx.createOscillator();
    osc.type = instrument.waveForm;
    osc.frequency.value = FREQUENCIES[note] * (_octave * 2);
    osc.connect(gainNode);

    playingNotes[note] = { osc: osc, gainNode: gainNode };

    let now = audioCtx.currentTime;
    let attackDuration = instrument.enveloppe.attack * eveloppeMaxTime;
    let attackEnd = now + attackDuration;
    let decayDuration = instrument.enveloppe.decay * eveloppeMaxTime;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, attackEnd);
    gainNode.gain.setTargetAtTime(instrument.enveloppe.sustain, attackEnd, decayDuration);

    osc.start();
}

function stopNote(note) {
    synth.stopNote(octave, note);
    return;

    if (!(note in playingNotes) || !playingNotes[note]) return;
    let gainNode = playingNotes[note].gainNode;
    playingNotes[note].gainNode.gain.cancelScheduledValues(0);

    let now = audioCtx.currentTime;
    let releaseDuration = instrument.enveloppe.release * eveloppeMaxTime;
    let releaseEnd = now + releaseDuration;

    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, releaseEnd);

    delete playingNotes[note];
}

function setInstrumentEnveloppe(param, value) {
    instrument.enveloppe[param] = value;
}

let keysMap = {
    'q': 'C',
    'z': 'C#',
    's': 'D',
    'e': 'Eb',
    'd': 'E',
    'f': 'F',
    't': 'F#',
    'g': 'G',
    'y': 'G#',
    'h': 'A',
    'u': 'Bb',
    'j': 'B',
};

let keyButtons = {};
let keysList = document.querySelectorAll('.audio-key');

keysList.forEach(key => {
    keyButtons[key.dataset.note] = key;

    key.addEventListener('mousedown', () => {
        key.classList.add('active');
        playNote(key.dataset.note);
    });

    key.addEventListener('mouseup', () => {
        key.classList.remove('active');
        stopNote(key.dataset.note);
    })
});

document.addEventListener('keydown', (event) => {
    if (activeTab !== 3) return;
    event.preventDefault();

    if (event.repeat) return;

    let key = event.key.toLowerCase();

    if (key in keysMap) {
        keyButtons[keysMap[key]].classList.add('active');
        playNote(keysMap[key]);
    } else {
        stopNote(keysMap[key]);
    }

    if (event.key == 'ArrowUp') {
        setOctave(octave + 1);
    } else if (event.key == 'ArrowDown') {
        setOctave(octave - 1);
    }
});

document.addEventListener('keyup', (event) => {
    if (activeTab !== 3) return;
    event.preventDefault();

    let key = event.key.toLowerCase();
    if (key in keysMap) {
        keyButtons[keysMap[key]].classList.remove('active');
        stopNote(keysMap[key]);
    }
})

addEventListener('audio-octave-plus', 'click', () => setOctave(octave + 1));
addEventListener('audio-octave-minus', 'click', () => setOctave(octave - 1));

addEventListener('audio-type-plus', 'click', () => setWaveForm(selectedWaveForm + 1));
addEventListener('audio-type-minus', 'click', () => setWaveForm(selectedWaveForm - 1));

addEventListener('audio-volume', 'input', (event) => mainGainNode.gain.value = parseFloat(event.target.value) / 100.0 * 0.1);
addEventListener('audio-attack', 'input', (event) => setInstrumentEnveloppe('attack', parseFloat(event.target.value) / 100.0 * 1));
addEventListener('audio-decay', 'input', (event) => setInstrumentEnveloppe('decay', parseFloat(event.target.value) / 100.0 * 1));
addEventListener('audio-sustain', 'input', (event) => setInstrumentEnveloppe('sustain', parseFloat(event.target.value) / 100.0 * 1));
addEventListener('audio-release', 'input', (event) => setInstrumentEnveloppe('release', parseFloat(event.target.value) / 100.0 * 3));

setOctave(4);
setWaveForm(0);

// ================================= Online editing ==========================================
let connection;

function startHost(id) {
    console.log('Starting Host...');
    let peer = new Peer('jsgameengine-peer-id-' + id);
    peer.on('open', () => {
        console.log('Host Started.', peer);

        peer.on('connection', (conn) => {
            connection = conn;
            console.log('Client connected', connection);
            connection.on('data', (data) => {
                console.log(data);
            });
        });
    });
}

function connectToHost(id) {
    console.log('Connecting...');

    let peer = new Peer();
    peer.on('open', () => {
        console.log('Client Connected', peer);

        let conn = peer.connect('jsgameengine-peer-id-' + id);
        conn.on('open', () => {
            connection = conn;
        });
    });
}

function sendData(data) {
    if (connection == null) return;
    connection.send(data);
}

document.getElementById("btn-host").addEventListener('click', () => {
    startHost(0);
});

document.getElementById("btn-connect").addEventListener('click', () => {
    connectToHost(0);
});

// ================================= Short Cuts ==========================================
document.addEventListener('keypress', (event) => {
    // if (event.ctrlKey && event.shiftKey) {
    //     event.preventDefault();
    //     activeTab = (activeTab + 1) % tabPanels.length;
    //     openTab(tabButtons[activeTab], tabPanels[activeTab].id);
    // }
    // if (event.ctrlKey && event.key == 'A') {
    // }
});