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

try {
    let gameData = JSON.parse(sessionStorage.getItem('gameData'));
    if (gameData != null) {
        app.loadGameData(gameData);
        loadCode(gameData.gameCode);
    }
} catch (error) {
    console.warn('Error trying to load session gameData');
}

// ==================================== TABS =============================================
class TabsManager {
    constructor(panels, buttons) {
        this.panels = panels;
        this.buttons = buttons;
        this.activeTab = 0;

        for (let i = 0; i < this.panels.length; i++)
            this.buttons[i].addEventListener('click', event => this.openTab(event.currentTarget, this.panels[i].id));

        if (sessionStorage.getItem('activeTab'))
            this.activeTab = sessionStorage.getItem('activeTab')
        this.openTab(this.buttons[this.activeTab], this.panels[this.activeTab].id);
    }

    openTab(button, id) {
        for (let i = 0; i < this.panels.length; i++) {
            this.panels[i].classList.remove("active");
            this.buttons[i].classList.remove("active");
        }
        this.activeTab = [...this.panels].findIndex(t => t.id == id);
        document.getElementById(id).classList.add("active");
        button.classList.add("active");
        sessionStorage.setItem("activeTab", this.activeTab);
    }
}

const tabsManager = new TabsManager(
    document.getElementsByClassName("tab-panel"),
    document.getElementsByClassName("tab-btn")
);

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

const codeWiki = document.getElementById("code-wiki");
const codeWikiList = [];
for (let [key, value] of Object.entries(app.contextDetails)) {
    console.log(`${key}: ${value}`);
    let div = document.createElement('div');
    div.className = 'code-wiki-entry';

    let label = document.createElement('h6');
    label.innerHTML = key;
    div.appendChild(label)

    codeWikiList.push(div);
    codeWiki.appendChild(div);
}

addEventListener('code-wiki-btn', 'click', () => codeWiki.classList.add('active'));
addEventListener('code-wiki-btn-close', 'click', () => codeWiki.classList.remove('active'))

// ================================= Sprite Editor ==========================================
const spriteEditorCanvas = document.getElementById('sprite-editor-canvas');
const spriteEditorCtx = spriteEditorCanvas.getContext('2d');
const spriteEditorTool = {
    type: 'pencil',
    canMove: true,
    color: [0, 0, 0, 255],
};
let selectedSprite = -1;

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

function loadImageOnEditor(x, y, image) {
    spriteEditorCtx.drawImage(image, x, y);
}

function loadImageDataOnEditor(x, y, image) {
    spriteEditorCtx.putImageData(image, x, y);
}

function clearSpriteEditor() {
    spriteEditorCtx.clearRect(0, 0, spriteEditorCanvas.width, spriteEditorCanvas.height);
}

const spriteEditorGrid = document.getElementById('sprite-editor-grid');
function setSpriteEditor(spriteSize) {
    spriteEditorCanvas.width = spriteSize;
    spriteEditorCanvas.height = spriteSize;
    spriteEditorGrid.innerHTML = '';
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

const spritesContainer = document.getElementById('sprites-container');
const spritesItems = []

function updateSpritesList() {
    let url = spriteEditorCanvas.toDataURL("image/png");
    spritesItems[selectedSprite].src = url;
    spritesItems[selectedSprite].classList.add('active');
    app.GameData.sprites[selectedSprite] = spriteEditorCtx.getImageData(0, 0, spriteEditorCanvas.width, spriteEditorCanvas.height);
}

function selectSprite(index) {
    selectedSprite = index;
    let sprite = app.getSprite(index);

    setSpriteEditor(sprite.width);
    loadImageDataOnEditor(0, 0, sprite);

    spritesItems.forEach(e => e.classList.remove('active'));
    spritesItems[index].classList.add('active');
}

for (let i = 0; i < 16; i++) {
    let element = document.createElement('img');
    element.classList = 'sprite-item';
    element.addEventListener('click', () => {
        selectSprite(i);
    })
    spritesContainer.appendChild(element);
    spritesItems.push(element);
}
selectSprite(0);

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

const palette = document.getElementById('sprite-palette');
const paletteColors = []
function setPalette(colors) {
    colors.forEach(color => {
        let el = document.createElement('div');
        el.className = 'sprite-color';
        el.style.backgroundColor = color;

        el.addEventListener('click', () => {
            paletteColors.forEach(e => e.classList.remove('active'));
            el.classList.add('active');

            let bigint = parseInt(color.substring(1), 16);
            let r = (bigint >> 16) & 255;
            let g = (bigint >> 8) & 255;
            let b = bigint & 255;
            spriteEditorTool.color = [r, g, b, 255];
        })
        paletteColors.push(el);
        palette.appendChild(el);
    });
}
setPalette(app.GameData.palette);

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
    updateSpritesList();
}

function setSelectedTool(tool) {
    let tools = document.getElementsByClassName('sprite-editor-tool');
    for (let i = 0; i < tools.length; i++) {
        tools[i].classList.remove('active');
    }
    document.getElementById('sprite-editor-' + tool).classList.add('active');
}
setSelectedTool('pencil');

let spriteEditor_isMouseDown = false;
spriteEditorCanvas.addEventListener("mousedown", (e) => {
    spriteEditor_isMouseDown = true;
    handleClick(e);
});
spriteEditorCanvas.addEventListener("mouseup", () => spriteEditor_isMouseDown = false);
spriteEditorCanvas.addEventListener("mousemove", (e) => {
    if (spriteEditor_isMouseDown && spriteEditorTool.canMove)
        handleClick(e);
});

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
        loadImageOnEditor(0, 0, image);
        URL.revokeObjectURL(image.src);
    }
    image.src = URL.createObjectURL(event.target.files[0]);
    event.target.value = '';
}, false);

// ================================= Audio ==========================================

// const audioCtx = new (AudioContext || webkitAudioContext)();
const audioCtx = new AudioContext();
const synth = new HtmlSynth(audioCtx);

const WAVE_FORMS = [
    'sine',
    'square',
    'sawtooth',
    'triangle',
]

let selectedWaveForm = 0;
let octave = 4;

let instrument = {
    waveForm: 'sine',
    enveloppe: {
        'attack': 0.01,
        'decay': 0.1,
        'sustain': 0,
        'release': 0.5,
    },
    filter: {
        type: 'none',
        frequency: 4400,
        resonance: 1,
    }
};

function setInstrumentEnveloppe(param, value) {
    instrument.enveloppe[param] = value;
}

function setWaveForm(newWaveForm) {
    selectedWaveForm = Math.min(Math.max(0, newWaveForm), WAVE_FORMS.length - 1);
    let s = WAVE_FORMS[selectedWaveForm];
    instrument.waveForm = WAVE_FORMS[selectedWaveForm];
    document.getElementById('audio-type').innerHTML = s.charAt(0).toUpperCase() + s.slice(1);
}

function setOctave(newOctave) {
    octave = Math.min(Math.max(0, newOctave), 25);
    document.getElementById('audio-octave').innerHTML = octave;
}

let notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
let notesColors = ['white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white'];
let keyboard = document.getElementById('audio-keyboard');

let keysMap = { 'q': 'C', 'z': 'C#', 's': 'D', 'e': 'Eb', 'd': 'E', 'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'Bb', 'j': 'B' };
let keys = {};

for (let keyOctave = 0; keyOctave < 2; keyOctave++) {
    for (let i = 0; i < notes.length; i++) {
        let key = document.createElement('button');
        key.className = 'audio-key ' + notesColors[i];
        key.dataset.note = notes[i];
        key.dataset.octave = keyOctave;

        key.addEventListener('mousedown', () => {
            key.classList.add('active');
            synth.playNote(instrument, octave + keyOctave, key.dataset.note);
        });

        key.addEventListener('mouseup', () => {
            key.classList.remove('active');
            synth.stopNote(octave + keyOctave, key.dataset.note);
        })

        keyboard.appendChild(key);
        if (keyOctave == 0)
            keys[key.dataset.note] = key;
    }
}

document.addEventListener('keydown', (event) => {
    if (tabsManager.activeTab !== 3 || event.repeat) return;
    event.preventDefault();

    let key = event.key.toLowerCase();
    if (!(key in keysMap)) return;

    let note = keysMap[key];
    keys[note].classList.add('active');
    synth.playNote(instrument, octave, note);

    if (event.key == 'ArrowUp') {
        setOctave(octave + 1);
    } else if (event.key == 'ArrowDown') {
        setOctave(octave - 1);
    }
});

document.addEventListener('keyup', (event) => {
    if (tabsManager.activeTab !== 3) return;
    event.preventDefault();

    let key = event.key.toLowerCase();
    if (key in keysMap) {
        keys[keysMap[key]].classList.remove('active');
        synth.stopNote(octave, keysMap[key]);
    }
})

addEventListener('audio-volume', 'input', (event) => synth.setVolume(parseFloat(event.target.value) / 100.0 * 0.1));

addEventListener('audio-octave-plus', 'click', () => setOctave(octave + 1));
addEventListener('audio-octave-minus', 'click', () => setOctave(octave - 1));

addEventListener('audio-type-plus', 'click', () => setWaveForm(selectedWaveForm + 1));
addEventListener('audio-type-minus', 'click', () => setWaveForm(selectedWaveForm - 1));

addEventListener('audio-attack', 'input', (event) => setInstrumentEnveloppe('attack', parseFloat(event.target.value) / 100.0 * 1));
addEventListener('audio-decay', 'input', (event) => setInstrumentEnveloppe('decay', parseFloat(event.target.value) / 100.0 * 1));
addEventListener('audio-sustain', 'input', (event) => setInstrumentEnveloppe('sustain', parseFloat(event.target.value) / 100.0 * 1));
addEventListener('audio-release', 'input', (event) => setInstrumentEnveloppe('release', parseFloat(event.target.value) / 100.0 * 3));

addEventListener('audio-filter-frequency', 'input', (event) => instrument.filter.frequency = (parseFloat(event.target.value) / 100.0 * 1));

setOctave(4);
setWaveForm(0);

// ================================= Online editing ==========================================
// let connection;

// function startHost(id) {
//     console.log('Starting Host...');
//     let peer = new Peer('jsgameengine-peer-id-' + id);
//     peer.on('open', () => {
//         console.log('Host Started.', peer);

//         peer.on('connection', (conn) => {
//             connection = conn;
//             console.log('Client connected', connection);
//             connection.on('data', (data) => {
//                 console.log(data);
//             });
//         });
//     });
// }

// function connectToHost(id) {
//     console.log('Connecting...');

//     let peer = new Peer();
//     peer.on('open', () => {
//         console.log('Client Connected', peer);

//         let conn = peer.connect('jsgameengine-peer-id-' + id);
//         conn.on('open', () => {
//             connection = conn;
//         });
//     });
// }

// function sendData(data) {
//     if (connection == null) return;
//     connection.send(data);
// }

// document.getElementById("btn-host").addEventListener('click', () => {
//     startHost(0);
// });

// document.getElementById("btn-connect").addEventListener('click', () => {
//     connectToHost(0);
// });

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