import { App } from "./main.js";
import { HtmlSynth } from "./engine.js";
import { CodeParser } from "./codeParser.js";

// ==================================== UTIL =============================================
function addEventListener(id, type, method) {
    document.getElementById(id).addEventListener(type, method);
}

// ==================================== APP =============================================
const CANVAS = document.getElementById("main-canvas");
const canvasContainer = document.getElementById("game-view");
const APP = new App(CANVAS);

let onCodeLoaded = () => {};

function INIT() {
    APP.onGameDataUpdate = (gameData) => sessionStorage.setItem('gameData', JSON.stringify(gameData));

    window.onresize = () => {
        if (canvasContainer == null || CANVAS == null) return;
        CANVAS.width = canvasContainer.clientWidth;
        CANVAS.height = canvasContainer.clientHeight;
    }

    addEventListener('btn-reload', 'click', () => APP.run());

    try {
        let gameData = JSON.parse(sessionStorage.getItem('gameData'));
        if (gameData != null) {
            APP.loadGameData(gameData);
            onCodeLoaded(gameData.gameCode);
        }
    } catch (error) {
        console.warn('Error trying to load session gameData', error);
    }
}

// ==================================== TABS =============================================
class TabsManager {
    constructor() {
        this.panels = document.getElementsByClassName("tab-panel");
        this.buttons = document.getElementsByClassName("tab-btn");
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
const tabsManager = new TabsManager();

// ================================= Main ==========================================

class FileManager {
    constructor() {
        document.getElementById('download').addEventListener('click', () => this.download());
        document.getElementById('load').addEventListener('change', event => this.onFileLoaded(event));
    }

    static getDownloadLink(filename, url) {
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

    download() {
        let filename = 'game.json';
        let file = new Blob([JSON.stringify(APP.GameData)], { type: 'json' });
        if (window.navigator.msSaveOrOpenBlob)
            window.navigator.msSaveOrOpenBlob(file, filename);
        else {
            let url = URL.createObjectURL(file);
            FileManager.getDownloadLink(filename, url);
        }
    }

    onFileLoaded(event) {
        let reader = new FileReader();
        reader.readAsText(event.target.files[0], 'UTF-8');
        reader.onload = readerEvent => {
            let gameData = JSON.parse(readerEvent.target.result);
            APP.loadGameData(gameData);
            codeInput.innerHTML = gameData.gameCode;
            updateCode(gameData.gameCode);
        }
    }
}
const fileManager = new FileManager();

// ================================= Code Editor ==========================================

class CodeEditor {
    constructor(codeParser) {
        this.codeParser = codeParser;

        this.codeInput = document.getElementById("code-area-input");
        this.codeArea = document.getElementById("code-area");
        this.codeAreaContent = document.getElementById("code-area-content");

        this.codeInput.addEventListener('input', (event) => this.updateCode(event.target.value));
        this.codeInput.addEventListener('scroll', (event) => this.syncScroll(event.target));
        this.codeInput.addEventListener('keydown', (event) => this.checkTab(event.target, event));

        this.setDoc();
    }

    loadCode(code) {
        let text = code.replace('\n', '\\\n');
        this.codeInput.innerHTML = code;
        this.updateCode(code);
    }

    updateCode(text) {
        let tokens = this.codeParser.parseTokens(text);
        this.codeAreaContent.innerHTML = this.codeParser.generateHtml(tokens);
        APP.setGameCode(text);
    }

    syncScroll(element) {
        this.codeArea.scrollTop = element.scrollTop;
        this.codeArea.scrollLeft = element.scrollLeft;
    }

    checkTab(e, event) {
        if (event.ctrlKey && event.key == "Z") {
            this.updateCode(e.value);
        } if (event.key == "Tab") {
            event.preventDefault();
            if (event.shiftKey) {

            } else {
                let cursor_pos = e.selectionEnd + 1;
                e.value = e.value.slice(0, e.selectionStart) + "\t" + e.value.slice(e.selectionEnd, e.value.length);
                e.selectionStart = cursor_pos;
                e.selectionEnd = cursor_pos;
                this.updateCode(e.value);
            }
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

            if (value.type == 'function') {
                let args = document.createElement('p');
                // for (let i = 0; i < value.arguments.length; i++) {
                //     args.innerHTML = args.innerHTML + ', ' + value.arguments[i];
                // }
                div.appendChild(args);
            } else if (value.type == 'value')
            {

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
onCodeLoaded = (code) => codeEditor.loadCode(code);

// ================================= Sprite Editor ==========================================
const spriteEditorTool = {
    type: 'pencil',
    canMove: true,
    color: [0, 0, 0, 255],
    hexColor: '#00000011',
};

class DrawingCanvas {
    constructor() {
        this.spriteEditorCanvas = document.getElementById('sprite-editor-canvas');
        this.spriteEditorCtx = this.spriteEditorCanvas.getContext('2d');
        this.spriteEditorGrid = document.getElementById('sprite-editor-grid');

        this.setSpriteSize(16);
    }

    setPixel(x, y, rgba) {
        let imgData = this.spriteEditorCtx.createImageData(1, 1);
        let d = imgData.data;
        d[0] = rgba[0];
        d[1] = rgba[1];
        d[2] = rgba[2];
        d[3] = rgba[3];
        this.spriteEditorCtx.putImageData(imgData, x, y);
    }

    getPixel(x, y) {
        let data = this.spriteEditorCtx.getImageData(x, y, 1, 1).data;
        return [data[0], data[1], data[2], data[3]];
    }

    loadImage(x, y, image) {
        this.spriteEditorCtx.drawImage(image, x, y);
    }

    loadImageData(x, y, image) {
        this.spriteEditorCtx.putImageData(image, x, y);
    }

    clear() {
        this.spriteEditorCtx.clearRect(0, 0, this.spriteEditorCanvas.width, this.spriteEditorCanvas.height);
    }

    getImageData() {
        return this.spriteEditorCtx.getImageData(0, 0, this.spriteEditorCanvas.width, this.spriteEditorCanvas.height);
    }

    getImageUrl() {
        return this.spriteEditorCanvas.toDataURL('image/png');
    }

    getClickPosition(event) {
        let rect = this.spriteEditorCanvas.getBoundingClientRect();
        let scaleFactor = rect.width / this.spriteEditorCanvas.width;
        let x = Math.floor((event.clientX - rect.left) / scaleFactor);
        let y = Math.floor((event.clientY - rect.top) / scaleFactor);
        return [x, y];
    }

    setSpriteSize(spriteSize) {
        this.spriteEditorCanvas.width = spriteSize;
        this.spriteEditorCanvas.height = spriteSize;
        this.spriteEditorGrid.innerHTML = '';
        this.spriteEditorGrid.style.gridTemplateColumns = `repeat(${spriteSize}, 1fr)`;
        this.spriteEditorGrid.style.gridTemplateRows = `repeat(${spriteSize}, 1fr)`;

        for (let x = 0; x < spriteSize; x++) {
            for (let y = 0; y < spriteSize; y++) {
                let cell = document.createElement('div');
                cell.className = 'sprite-editor-cell';
                this.spriteEditorGrid.appendChild(cell);
            }
        }
        
        this.width = this.spriteEditorCanvas.width;
        this.height = this.spriteEditorCanvas.height;
    }

    addEventListener(event, callback) {
        this.spriteEditorCanvas.addEventListener(event, callback);
    }
}

class SpriteList {
    constructor(drawingCanvas) {
        this.drawingCanvas = drawingCanvas;
        this.spritesContainer = document.getElementById('sprites-container');
        this.spritesItems = [];
        this.selectedSprite = 0;

        this.setListSize(16);
        this.selectSprite(this.selectedSprite);
    }

    updateSpritesList() {
        this.spritesItems[this.selectedSprite].src = this.drawingCanvas.getImageUrl();
        this.spritesItems[this.selectedSprite].classList.add('active');
        APP.setSprite(this.selectedSprite, this.drawingCanvas.getImageData());
    }

    selectSprite(index) {
        this.selectedSprite = index;
        let sprite = APP.getSprite(index);

        this.drawingCanvas.setSpriteSize(sprite.width);
        this.drawingCanvas.loadImageData(0, 0, sprite);

        this.spritesItems.forEach(e => e.classList.remove('active'));
        this.spritesItems[index].classList.add('active');
    }

    setListSize(size) {
        this.spritesItems = [];
        this.spritesContainer.innerHTML = '';

        for (let i = 0; i < size; i++) {
            let element = document.createElement('img');
            element.classList = 'sprite-item';
            element.addEventListener('click', () => {
                this.selectSprite(i);
            })
            this.spritesContainer.appendChild(element);
            this.spritesItems.push(element);
        }
    }
}

class ColorPalette {

    constructor() {
        this.palette = document.getElementById('sprite-palette');
        this.paletteColors = [];
        this.setPalette(APP.GameData.palette);

        // this.spriteEditorColorPicker = document.getElementById('sprite-editor-color-picker');
        // this.spriteEditorColorPickerLabel = document.getElementById('sprite-editor-color-picker-label');
    }

    hexToRGB(hex) {
        let bigint = parseInt(hex.substring(1), 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return [r, g, b, 255];
    }

    setColorPicker() {
        this.spriteEditorColorPicker.value = '#000000';
        this.spriteEditorColorPickerLabel.style.background = '#000000';

        this.spriteEditorColorPicker.addEventListener("input", (event) => {
            let inputColor = event.target.value;
            spriteEditorTool.color = this.hexToRGB(inputColor);
            spriteEditorTool.hexColor = inputColor;
            this.spriteEditorColorPickerLabel.style.background = inputColor;
        });
    }

    setPalette(colors) {
        colors.forEach(hexColor => {
            let el = document.createElement('div');
            el.className = 'sprite-color';
            el.style.backgroundColor = hexColor;

            el.addEventListener('click', () => {
                this.paletteColors.forEach(e => e.classList.remove('active'));
                el.classList.add('active');
                spriteEditorTool.color = this.hexToRGB(hexColor);
            })
            this.paletteColors.push(el);
            this.palette.appendChild(el);
        });
    }
}

class SpriteEditor {
    constructor(drawingCanvas, colorPalette, spritesList) {
        this.drawingCanvas = drawingCanvas;
        this.colorPalette = colorPalette;
        this.spritesList = spritesList;
        
        this.toolsContainer = document.getElementById('sprite-editor-tools');
        
        this.tools = []
        this.currentTool = null;
        this.isMouseDown = false;
        this.setEvents();
    }

    setEvents() {
        this.drawingCanvas.addEventListener("mouseup", () => this.isMouseDown = false);
        this.drawingCanvas.addEventListener("mousedown", (e) => {
            this.isMouseDown = true;
            this.handleClick(e);
        });
        this.drawingCanvas.addEventListener("mousemove", (e) => {
            if (this.isMouseDown && this.currentTool.canMove)
                this.handleClick(e);
        });
    }

    setSelectedTool(tool) {
        this.currentTool = tool;

        for (let i = 0; i < this.tools.length; i++) {
            if (this.tools[i].innerHTML == tool.name)
                this.tools[i].classList.add('active');
            else
                this.tools[i].classList.remove('active');
        }
    }

    addTool(tool) {
        let btn = document.createElement('button');
        btn.innerHTML = tool.name;
        btn.className = 'btn sprite-editor-tool';
        btn.id = `sprite-editor-${tool.name}`;

        btn.addEventListener('click', () => {
            this.setSelectedTool(tool);
        });

        this.toolsContainer.appendChild(btn);
        this.tools.push(btn);
    }

    handleClick(event) {
        let pos = this.drawingCanvas.getClickPosition(event);
        this.currentTool.callback(this.drawingCanvas, pos[0], pos[1], spriteEditorTool.color);
        this.spritesList.updateSpritesList();
    }
}

const drawingCanvas = new DrawingCanvas();
const spritesList = new SpriteList(drawingCanvas);
const colorPalette = new ColorPalette();
const spriteEditor = new SpriteEditor(drawingCanvas, colorPalette, spritesList);

const pencil = {
    name: 'pencil',
    canMove: true,
    callback: (drawingCanvas, x, y, color) => {
        drawingCanvas.setPixel(x, y, color);
    }
}
spriteEditor.addTool(pencil);
spriteEditor.setSelectedTool(pencil);

spriteEditor.addTool({
    name: 'eraser',
    canMove: true,
    callback: (drawingCanvas, x, y, color) => {
        drawingCanvas.setPixel(x, y, [0, 0, 0, 0]);
    }
});

spriteEditor.addTool({
    name: 'bucket',
    canMove: false,
    callback: (drawingCanvas, x, y, color) => {
        const areColorEquals = (a, b) => {
            return a.length === b.length && a.every((value, index) => value === b[index]);
        }

        const areColorSimilar = (a, b) => {
            return a.length === b.length && a.every((value, index) => value === b[index]);
        }

        const floodFill = (x, y, oldColor, newColor) => {
            if (x < 0 || y < 0 || x >= drawingCanvas.width || y >= drawingCanvas.height) return;
            if (areColorEquals(drawingCanvas.getPixel(x, y), newColor)) return;
            if (!areColorSimilar(drawingCanvas.getPixel(x, y), oldColor)) return;

            drawingCanvas.setPixel(x, y, newColor);
            floodFill(x + 1, y, oldColor, newColor);  // then i can either go south
            floodFill(x - 1, y, oldColor, newColor);  // or north
            floodFill(x, y + 1, oldColor, newColor);  // or east
            floodFill(x, y - 1, oldColor, newColor);  // or west
            return;
        }
        
        let oldColor = drawingCanvas.getPixel(x, y);
        if (areColorEquals(oldColor, color)) return;
        floodFill(x, y, oldColor, color);
    }
});

// addEventListener('sprite-editor-download', 'click', () => {
//     FileManager.getDownloadLink('sprite.png', spriteEditorCanvas.toDataURL("image/png"));
// });

// addEventListener('sprite-editor-load', 'change', event => {
//     let image = new Image();
//     image.onload = () => {
//         clearSpriteEditor();
//         loadImageOnEditor(0, 0, image);
//         URL.revokeObjectURL(image.src);
//     }
//     image.src = URL.createObjectURL(event.target.files[0]);
//     event.target.value = '';
// }, false);

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

INIT();