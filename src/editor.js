import { App } from "./main.js";
import { HtmlSynth } from "./engine.js";
import { CodeParser } from "./codeParser.js";

// ==================================== UTIL =============================================
function addEventListener(id, type, method) {
    document.getElementById(id).addEventListener(type, method);
}

function createElement(tag, className) {
    let el = document.createElement(tag);
    el.className = className;
    return el;
}

let templateGame = `
SET_BACKGROUND('black');

let pixels = [];
let particles = [];
let blocks = [];
let lives = 3;
let score = 0;
let speed = 0.5;

function spawnParticles(x, y) {
	for (let i=0; i < 25; i++) {
		particles.push({
			x: x,
			y: y,
			dx: RANDOM_RANGE(-1, 0),
			dy: RANDOM_RANGE(-0.5, 0.5),
		});
	}
}

let timer = 0;
function UPDATE() {
	timer++;
    score += 0.1;
    speed += 0.0001;
	if (timer > 20) {
		timer = 0;

		blocks.push({
			speed: speed,
			x: SCREEN_WIDTH,
			y: Math.round(RANDOM_RANGE(0, SCREEN_HEIGHT)),
			width: 3,
			height: 3,
		});
	}

	blocks = blocks.filter(b => {
		b.x -= b.speed;

		if (IS_MOUSE_OVER(b)) {
			lives--;
			spawnParticles(b.x, b.y);
			return false;
		}
		return b.x > 0;
	});

	particles = particles.filter(p => {
		p.x += p.dx;
		p.y += p.dy;
		p.dy += 0.02;
		return p.x >= 0 && p.y <= SCREEN_HEIGHT;
	});

	pixels = pixels.filter(px => {
		px.x -= 0.5;
		px.y += px.d;
		return px.x >= 0;
	});
	pixels.push({x: MOUSE_POS.x, y: MOUSE_POS.y, d: RANDOM_RANGE(-0.1, 0.1)});
}

let i = 0;
function DRAW() {
	blocks.forEach(b => {
		DRAW_RECT(b.x, b.y, b.width, b.height, "red");
	})

	particles.forEach(p => {
		DRAW_PIXEL(p.x, p.y, 'red');
	})

	TEXT(lives.toString(), 0, 0, 15, 'white');

	i += 0.1 % 60;
	for (let j=0; j < pixels.length; j++) {
		let color = COLOR_HSL((j + i % 40) / 40 * 360, 100, 50);
		DRAW_PIXEL(pixels[j].x, pixels[j].y, color);
	}
}
`;

// ==================================== APP =============================================
const CANVAS = document.getElementById("main-canvas");
const canvasContainer = document.getElementById("game-view");
const APP = new App(CANVAS);

let onCodeLoaded = () => { };

function INIT() {
    APP.onGameDataUpdate = (gameData) => {
        sessionStorage.setItem('gameData', JSON.stringify(gameData))
        console.log(gameData);
    };

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
        } else {
            APP.loadGameData({ gameCode: templateGame });
            onCodeLoaded(templateGame);
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
        this.lineNumbers = document.getElementById("code-line-number");

        this.codeInput.addEventListener('input', (event) => this.updateCode(event.target.value));
        this.codeInput.addEventListener('scroll', (event) => this.syncScroll(event.target));
        this.codeInput.addEventListener('keydown', (event) => this.handleKeyInput(event));

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
        this.setLineNumbers();
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
        this.updateCode(txt);
    }

    setLineNumbers() {
        this.lineNumbers.innerHTML = '';
        let textLines = this.codeInput.value.split("\n");
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
                this.updateCode(e.value);
            }
        }

        let chars = { '(': ')', '{': '}', '[': ']' }
        if (key in chars) {
            event.preventDefault();
            wrap(key, chars[key]);
            e.selectionStart = cursor_pos;
            e.selectionEnd = cursor_pos;
            this.updateCode(e.value);
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
onCodeLoaded = (code) => codeEditor.loadCode(code);

// ================================= Sprite Editor ==========================================
const spriteEditorTool = {
    type: 'pencil',
    canMove: true,
    colorId: 0,
    currentSpriteId: 0,
    color: [0, 0, 0, 255],
    hexColor: '#00000011',
};

class ColorPalette {

    constructor() {
        this.paletteContainer = document.getElementById('sprite-palette');
        this.paletteItems = [];
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

    getRGB(id) {
        return this.hexToRGB(APP.GameData.palette[id]);
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
        colors.forEach((hexColor, index) => {
            let el = document.createElement('div');
            el.className = 'sprite-color';
            el.id = 'sprite-color-' + index;
            el.style.backgroundColor = hexColor;

            el.addEventListener('click', () => {
                this.paletteItems.forEach(e => e.classList.remove('active'));
                el.classList.add('active');
                spriteEditorTool.color = this.hexToRGB(hexColor);
                spriteEditorTool.colorId = index;
            })
            this.paletteItems.push(el);
            this.paletteContainer.appendChild(el);
        });
    }
}

class DrawingCanvas {
    constructor(palette) {
        this.palette = palette;

        this.spriteEditorCanvas = document.getElementById('sprite-editor-canvas');
        this.spriteEditorCtx = this.spriteEditorCanvas.getContext('2d');
        this.spriteEditorGrid = document.getElementById('sprite-editor-grid');

        this.setSpriteSize(16);
    }

    setPixel(x, y, rgba, colorId) {
        let imgData = this.spriteEditorCtx.createImageData(1, 1);
        let d = imgData.data;
        d[0] = rgba[0];
        d[1] = rgba[1];
        d[2] = rgba[2];
        d[3] = rgba[3];
        this.spriteEditorCtx.putImageData(imgData, x, y);
        APP.setPixel(spriteEditorTool.currentSpriteId, x, y, colorId);
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

        this.setListSize(16);
        this.selectSprite(spriteEditorTool.currentSpriteId);
    }

    updateSelectedSprite() {
        let i = spriteEditorTool.currentSpriteId;
        this.spritesItems[i].src = this.__getImageSrc(APP.getSpriteImg(i));;
        this.spritesItems[i].classList.add('active');
    }

    selectSprite(index) {
        spriteEditorTool.currentSpriteId = index;
        let sprite = APP.getSpriteImg(index);

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
            element.src = this.__getImageSrc(APP.getSpriteImg(i));
            this.spritesContainer.appendChild(element);
            this.spritesItems.push(element);
        }
    }

    __getImageSrc(imageData) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
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
        this.spritesList.updateSelectedSprite();
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
        drawingCanvas.setPixel(x, y, color, spriteEditorTool.colorId);
    }
}
spriteEditor.addTool(pencil);
spriteEditor.setSelectedTool(pencil);

spriteEditor.addTool({
    name: 'eraser',
    canMove: true,
    callback: (drawingCanvas, x, y, color) => {
        drawingCanvas.setPixel(x, y, [0, 0, 0, 0], -1);
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

            drawingCanvas.setPixel(x, y, newColor, spriteEditorTool.colorId);
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

// --------------------------------- Melody Writer ------------------------------------------

class MelodyWriter {
    constructor() {
        this.container = document.getElementById('audio-melody');
        this.NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
        this.NOTES_DATA = [];

        this.notesCount = 32;
        this.octaveCount = 4;
        this.containerWidth = 0;
        this.containerHeight = 0;

        this.rows = {};
        this.melody = {};
        this.notes = {};
        this.currentDraggedNote = null;
        this.currentDraggedResizer = null;

        this.__setNotesData();
        this.__setRows(4);

        this.container.addEventListener('dragover', (event) => this.__dragNoteX(event));
        this.onMelodyChange = () => { console.log(this.melody) };
    }

    __setNotesData() {
        for (let i = 0; i < this.octaveCount; i++) {
            for (let j = 0; j < this.NOTES.length; j++) {
                this.NOTES_DATA[this.NOTES.length * i + j] = {
                    key: this.NOTES[j],
                    octave: i,
                }
            }
        }
    }

    __setRows() {
        this.container.innerHTML = "";
        this.rows = {};

        for (let i = 0; i < this.NOTES.length * this.octaveCount; i++) {
            const row = createElement('div', 'audio-melody-row');
            row.id = i;
            this.container.appendChild(row);
            this.rows[i] = row;

            for (let k = 0; k < this.notesCount; k++) {
                const separator = createElement('span', 'audio-melody-row-seprator');
                separator.style.left = `${(k / this.notesCount) * 100}%`;
                separator.style.width = `${(1 / this.notesCount) * 100}%`;
                row.appendChild(separator);
            }

            row.addEventListener('click', event => {
                if (event.detail === 2) {
                    let time = Math.round(event.clientX / row.offsetWidth * this.notesCount) - 1;
                    this.__addNote(i, time);
                }
            });
            row.addEventListener('dragover', (event) => this.__dragNoteY(event, i));
        }

        this.containerWidth = this.container.clientWidth;
        this.containerHeight = this.container.clientHeight;
    }

    __addNote(index, time) {
        let id = Date.now();
        let note = {
            index: index,
            octave: this.NOTES_DATA[index].octave,
            key: this.NOTES_DATA[index].key,
            time: time,
            endTime: 1,
            length: 1,
        };
        this.melody[id] = note;

        const noteElement = createElement('div', 'audio-melody-note');
        noteElement.style.left = `${time / this.notesCount * 100}%`;
        noteElement.style.width = `calc(${note.length / this.notesCount * 100}% - 6px)`;
        noteElement.draggable = true;
        this.notes[id] = noteElement;
        this.rows[index].appendChild(noteElement);

        noteElement.addEventListener('click', (event) => {
            event.stopPropagation();
            if (event.detail === 2) {
                noteElement.remove();
                delete this.melody[id];
            }
        });

        noteElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setDragImage(event.target, window.outerWidth, window.outerHeight);
            this.currentDraggedNote = {
                id: id,
                note: note,
                element: noteElement,
                startX: event.clientX,
                startY: event.clientY,
            };
        });

        noteElement.addEventListener('dragend', () => {
            if (this.currentDraggedNote == null) return;
            this.setNote(this.currentDraggedNote.id);
            this.currentDraggedNote = null;
        });

        const noteResizeElement = createElement('div', 'audio-melody-note-resizer');
        noteResizeElement.draggable = true;
        noteElement.appendChild(noteResizeElement);

        noteResizeElement.addEventListener('dragstart', (event) => {
            event.stopPropagation();
            event.dataTransfer.setDragImage(event.target, window.outerWidth, window.outerHeight);
            this.currentDraggedResizer = {
                id: id,
                note: note,
                element: noteElement,
                startX: noteElement.clientX,
            };
        });
        noteResizeElement.addEventListener('dragend', () => {
            if (this.currentDraggedResizer == null) return;
            this.setNote(this.currentDraggedResizer.id);
            this.currentDraggedResizer = null;
        });
    }

    __dragNoteX(event) {
        event.preventDefault();
        if (this.currentDraggedResizer != null) {
            let x = event.clientX / this.container.offsetWidth * this.notesCount;
            let id = this.currentDraggedResizer.id;
            this.setNoteLength(id, Math.round(Math.max(x, 0)) - this.melody[id].time);
        } else if (this.currentDraggedNote != null) {
            let x = event.clientX / this.container.offsetWidth * this.notesCount;
            this.setNoteTime(this.currentDraggedNote.id, Math.round(Math.max(x - 1, 0)));
        }
    }

    __dragNoteY(event, rowIndex) {
        event.preventDefault();
        if (this.currentDraggedNote == null || this.currentDraggedResizer != null)
            return;
        this.setNoteRow(this.currentDraggedNote.id, rowIndex);
    }

    setNoteRow(id, index) {
        let note = this.melody[id];
        note.index = index;
        note.octave = this.NOTES_DATA[index].octave;
        note.key = this.NOTES_DATA[index].key;
        this.rows[index].appendChild(this.notes[id]);
    }

    setNoteTime(id, time) {
        this.melody[id].time = time;
        this.notes[id].style.left = `${time / this.notesCount * 100}%`;
    }

    setNoteLength(id, length) {
        let note = this.melody[id];
        note.length = length;
        note.endTime = note.time + length;
        this.notes[id].style.width = `calc(${length / this.notesCount * 100}% - 6px)`;
    }

    setNote(id) {
        let note = this.melody[id];
        this.setNoteTime(id, Math.min(note.time, this.notesCount - 1));
        this.setNoteLength(id, Math.min(note.length, this.notesCount - note.time));
        this.onMelodyChange();
    }
}
const melodyWriter = new MelodyWriter();

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