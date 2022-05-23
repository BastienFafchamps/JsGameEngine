import { App } from "./main.js";
import { HtmlSynth } from "./engine.js";
import { CodeParser } from "./codeParser.js";

// ==================================== UTIL =============================================
function addEventListener(id, type, method) {
    document.getElementById(id).addEventListener(type, method);
}

function createElement(tag, data, parent = null) {
    let el = document.createElement(tag);
    for (let key in data) {
        el[key] = data[key];
    }

    if (parent != null)
        parent.appendChild(el);

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
let gameOver = false;

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
	if (lives <= 0) {
		gameOver = true;
	}

	timer++;
  
	if (gameOver == false) {
		score += 0.1;
  	speed += 0.0001;
	}

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

		if (gameOver == false && IS_MOUSE_OVER(b)) {
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

	if (gameOver == false)
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
	
	if (gameOver) {
  	TEXT('GAME OVER', SCREEN_WIDTH / 2 - 17, SCREEN_HEIGHT / 2 - 3, 15, 'white');
		TEXT(lives.toString(), SCREEN_WIDTH / 2 - 3, SCREEN_HEIGHT / 2 + 5, 15, 'white');
	} else {
		TEXT(lives.toString(), 1, 1, 15, 'white');
	}

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

class GraphView {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = '-webkit-crisp-edges';
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = 'crisp-edges';

        this.ctx = canvas.getContext('2d');
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setPixel(x, y) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, 1, 1);
    }

    drawLine(x0, y0, x1, y1) {
        x0 = parseInt(x0);
        x1 = parseInt(x1);
        y0 = parseInt(this.canvas.height - (y0 * this.canvas.height));
        y1 = parseInt(this.canvas.height - (y1 * this.canvas.height));

        const dx = x1 - x0;
        const dy = y1 - y0;
        const absdx = Math.abs(dx);
        const absdy = Math.abs(dy);

        let x = x0;
        let y = y0;

        this.setPixel(x, y);

        const handle = (x, y, dx, dy, absdx, absdy, setPixel) => {
            let d = 2 * absdy - absdx;
            for (let i = 0; i < absdx; i++) {
                x = dx < 0 ? x - 1 : x + 1;
                if (d < 0) {
                    d = d + 2 * absdy
                } else {
                    y = dy < 0 ? y - 1 : y + 1;
                    d = d + (2 * absdy - 2 * absdx);
                }
                setPixel(x, y);
            }
        }

        // slope < 1
        if (absdx > absdy) {
            handle(x, y, dx, dy, absdx, absdy, (x, y) => this.setPixel(x, y));
        } else { // case when slope is greater than or equals to 1
            handle(y, x, dy, dx, absdy, absdx, (y, x) => this.setPixel(x, y));
        }
    }
}

class InstrumentBuilder {
    constructor() {
        this.maxs = { attack: 3, decay: 3, sustain: 1, release: 10, total: 17 }
        this.container = document.getElementById('instrument-nodes');
        this.instrument = {
            volume: 0.6,
            nodes: [{
                type: 'oscillator',
                waveForm: 'sawtooth',
                attack: 0.01,
                decay: 0,
                sustain: 1,
                release: 1,
            }]
        };

        this.container.innerHTML = '';
        this.selectInstrument(this.instrument);

        this.inputVolume = document.getElementById('melody-volume');
        this.inputBpm = document.getElementById('melody-bpm');
        this.inputBeats = document.getElementById('melody-beats');

        this.inputVolume.addEventListener('input', event => {
            let min = 0, max = 1;
            this.instrument.volume = parseFloat(event.target.value) / 100.0 * max - min;
            console.log(this.instrument.volume);
        });

    }

    selectInstrument(instrument) {
        this.instrument = instrument;
        this.container.innerHTML = '';
        this.container.appendChild(createElement('button', { innerText: '+', className: 'instrument-add-node' }));
        instrument.nodes.forEach(node => {
            if (node.type == 'oscillator') {
                let nodeElement = this.__createOscillatorNode(node);
                this.container.appendChild(nodeElement);
            }
        })
    }

    __createOscillatorNode(node) {
        let nodeElement = this.__createNode("Oscillator");

        let waveFormSelect = this.__createNodeInputSelector(['sine', 'square', 'sawtooth', 'triangle']);
        waveFormSelect.addEventListener('input', (event) => node.waveForm = event.target.value);
        waveFormSelect.value = node.waveForm;
        nodeElement.appendChild(waveFormSelect);

        let canvas = createElement('canvas', { className: 'instrument-oscillator', width: 50, height: 10 });
        nodeElement.appendChild(canvas);

        let graph = new GraphView(canvas);
        const updateCanvas = () => {
            graph.clear();
            const relativeToWidth = (v) => v / this.maxs.total * 50;
            let attackX = relativeToWidth(node.attack);
            let decayX = relativeToWidth(node.decay);
            let sustainY = node.sustain;
            let sustainX = relativeToWidth(3);
            let releaseX = relativeToWidth(node.release);

            graph.drawLine(0, 0, attackX, 1);
            graph.drawLine(attackX, 1, attackX + decayX, sustainY);
            graph.drawLine(attackX + decayX, sustainY, attackX + decayX + sustainX, sustainY);
            graph.drawLine(attackX + decayX + sustainX, sustainY, attackX + decayX + sustainX + releaseX, 0);
        };
        updateCanvas();

        const createOscilatorSlider = (label, key) => {
            let [_, input] = this.__createNodeInput(label, 'range', { min: 0, max: 100 });
            input.addEventListener('input', (event) => {
                node[key] = parseFloat(event.target.value) / 100.0 * this.maxs[key];
                updateCanvas();
            });
            input.value = node[key] * (100.0 / this.maxs[key]);
            nodeElement.appendChild(_);
        }

        createOscilatorSlider('Attack', 'attack');
        createOscilatorSlider('Decay', 'decay');
        createOscilatorSlider('Sustain', 'sustain');
        createOscilatorSlider('Release', 'release');

        return nodeElement;
    }

    __createNode(label) {
        let nodeElement = createElement('div', { className: 'instrument-node' });
        createElement('p', { className: 'instrument-node-label', innerText: label }, parent = nodeElement);
        return nodeElement;
    }

    __createNodeInput(label, type, data) {
        let inputContainer = createElement('div', { className: 'instrument-node-input horizontal' });
        createElement('label', { innerText: label }, parent = inputContainer);

        let input = createElement('input', { type: type }, parent = inputContainer);
        for (let key in data) {
            input[key] = data[key];
        }
        return [inputContainer, input];
    }

    __createNodeInputSelector(values) {
        let nodeElement = createElement('select', { className: 'instrument-node-input' });
        values.forEach(val => createElement('option', { value: val, text: val }, parent = nodeElement));
        return nodeElement;
    }
}

// --------------------------------- Melody Writer ------------------------------------------
class MelodyWriter {
    constructor() {
        this.container = document.getElementById('melody-container');
        this.NOTES = ['C', 'C#', 'D', 'E#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.NOTES_COLOR = ['white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white'];
        this.SCALES = {
            'g-major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
            'f-major': ['F', 'G', 'A', 'A#', 'C', 'D', 'E'],
            'b-major': ['B', 'C#', 'E#', 'E', 'F#', 'G#', 'A#'],
            'f#-major': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
        }
        this.NOTES_DATA = [];
        
        this.octaveCount = 6;

        this.rows = {};
        this.melody = {};

        this.noteElements = {};
        this.currentDraggedNote = null;
        this.currentDraggedResizer = null;

        this.__setNotesData();
        this.__setRows();

        this.container.addEventListener('dragover', (event) => this.__dragNoteX(event));
        this.onMelodyChange = () => { console.log(this.melody) };

        this.inputBpm = document.getElementById('melody-bpm');
        this.inputBpm.addEventListener('input', event => this.melody.bpm = parseInt(event.target.value));

        this.inputBeats = document.getElementById('melody-beats');
        this.inputBeats.addEventListener('input', event => {
            this.melody.beatCount = parseInt(event.target.value);
            this.__setRows();
            this.setMelody(this.melody);
        });
    }

    setMelody(melody) {
        this.melody = melody;

        this.inputBeats.value = this.melody.beatCount;
        this.__setRows();

        console.log(this.melody.notes);
        Object.values(this.melody.notes).forEach(note => {
            let noteData = this.__addNote(note);
            this.setNote(noteData.id);
        });
    }

    __setNotesData() {
        for (let i = 0; i < this.octaveCount; i++) {
            for (let j = 0; j < this.NOTES.length; j++) {
                this.NOTES_DATA[this.NOTES.length * i + j] = {
                    key: this.NOTES[this.NOTES.length - 1 - j],
                    octave: this.octaveCount - i,
                    color: this.NOTES_COLOR[this.NOTES.length - 1 - j],
                }
            }
        }
    }

    __setRows() {
        this.container.innerHTML = "";
        this.rows = {};

        for (let i = 0; i < this.NOTES_DATA.length; i++) {
            const row = createElement('div', {
                className: 'melody-container-row ' + this.NOTES_DATA[i].color,
                id: i,
                innerText: `${this.NOTES_DATA[i].octave}${this.NOTES_DATA[i].key}`,
            }, parent = this.container);
            this.rows[i] = row;

            for (let k = 0; k < this.melody.beatCount; k++) {
                const separator = createElement('span', { className: 'melody-container-row-seprator' }, parent = row);
                separator.style.left = `${(k / this.melody.beatCount) * 100}%`;
                separator.style.width = `${(1 / this.melody.beatCount) * 100}%`;
            }

            row.addEventListener('click', event => {
                if (event.detail === 2) {
                    this.__addNote({
                        id: Date.now(),
                        index: i,
                        octave: this.NOTES_DATA[i].octave,
                        key: this.NOTES_DATA[i].key,
                        time: Math.round(event.clientX / row.offsetWidth * this.melody.beatCount) - 1,
                        endTime: 1,
                        length: 1,
                    });
                }
            });
            row.addEventListener('dragover', (event) => this.__dragNoteY(event, i));
        }
    }

    __addNote(note) {
        let id = note.id;
        this.melody.notes[id] = note;

        const noteElement = createElement('div', { className: 'melody-container-note', draggable: true }, parent = this.rows[note.index]);
        noteElement.style.left = `${note.time / this.melody.beatCount * 100}%`;
        noteElement.style.width = `calc(${note.length / this.melody.beatCount * 100}% - 6px)`;
        this.noteElements[id] = noteElement;

        noteElement.addEventListener('click', (event) => {
            event.stopPropagation();
            if (event.detail === 2) {
                noteElement.remove();
                delete this.melody.notes[id];
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

        const noteResizeElement = createElement('div', { className: 'melody-container-note-resizer' }, parent = noteElement);
        noteResizeElement.draggable = true;

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

        return note;
    }

    __dragNoteX(event) {
        event.preventDefault();
        if (this.currentDraggedResizer != null) {
            let x = event.clientX / this.container.offsetWidth * this.melody.beatCount;
            let id = this.currentDraggedResizer.id;
            this.setNoteLength(id, Math.round(Math.max(x, 0)) - this.melody.notes[id].time);
        } else if (this.currentDraggedNote != null) {
            let x = event.clientX / this.container.offsetWidth * this.melody.beatCount;
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
        let note = this.melody.notes[id];
        note.index = index;
        note.octave = this.NOTES_DATA[index].octave;
        note.key = this.NOTES_DATA[index].key;
        this.rows[index].appendChild(this.noteElements[id]);
    }

    setNoteTime(id, time) {
        this.melody.notes[id].time = time;
        this.noteElements[id].style.left = `${time / this.melody.beatCount * 100}%`;
    }

    setNoteLength(id, length) {
        let note = this.melody.notes[id];
        note.length = length;
        note.endTime = note.time + length;
        this.noteElements[id].style.width = `calc(${length / this.melody.beatCount * 100}% - 6px)`;
    }

    setNote(id) {
        let note = this.melody.notes[id];
        this.setNoteTime(id, Math.min(note.time, this.melody.beatCount - 1));
        this.setNoteLength(id, Math.min(note.length, this.melody.beatCount - note.time));
        this.onMelodyChange();
    }
}

class AudioPanel {

    constructor(melodyWriter, instrumentBuilder) {
        this.melodyWriter = melodyWriter;
        this.instrumentBuilder = instrumentBuilder;

        this.sounds = APP.GameData.sounds;
        this.selectedSound = {};
        this.btns = [];

        this.playButton = document.getElementById('melody-play-button');
        this.playButton.addEventListener('click', () => {
            APP.AUDIO_PLAYER.playSound(this.selectedSound);
        });

        this.selectorContainer = document.getElementById('melody-selector');
        this.setSelectors();

        this.inputVolume = document.getElementById('melody-volume');
        this.inputVolume.addEventListener('input', event => {
            let min = 0, max = 1;
            this.selectedSound.volume = parseFloat(event.target.value) / 100.0 * max - min;
        });

        this.inputBpm = document.getElementById('melody-bpm');
        this.inputBpm.addEventListener('input', event => this.selectedSound.bpm = parseInt(event.target.value));

        // this.notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
        // this.notesColors = ['white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white'];
        // this.keysMap = { 'q': 'C', 'z': 'C#', 's': 'D', 'e': 'Eb', 'd': 'E', 'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'Bb', 'j': 'B' };
        // this.keys = {};
        // this.keyboard = document.getElementById('audio-keyboard');
        // this.setKeyboard();
    }

    selectSound(index) {
        if (APP.GameData.sounds[index] == null) {
            APP.GameData.sounds[index] = {
                bpm: 120,
                volume: 0.8,
                melody: {
                    notes: {},
                    beatCount: 8,
                },
                instrument: {
                    nodes: [{
                        type: 'oscillator',
                        waveForm: 'sawtooth',
                        attack: 0.01,
                        decay: 0,
                        sustain: 1,
                        release: 1,
                    }]
                },
            };
        }

        this.selectedSound = APP.GameData.sounds[index];
        this.melodyWriter.setMelody(this.selectedSound.melody);
        this.instrumentBuilder.selectInstrument(this.selectedSound.instrument);

        for (let j = 0; j < this.btns.length; j++)
            this.btns[j].classList.remove('selected');
        this.btns[index].classList.add('selected');
    }

    setSelectors() {
        for (let i = 0; i < 16; i++) {
            let btn = createElement('button', { className: 'melody-selector-btn', innerText: i });
            this.selectorContainer.appendChild(btn);
            this.btns.push(btn);

            btn.addEventListener('click', () => {
                this.selectSound(i);
            });
        }
        this.selectSound(0);
    }

    setKeyboard() {
        // addEventListener('instrument-octave-plus', 'click', () => setOctave(octave + 1));
        // addEventListener('instrument-octave-minus', 'click', () => setOctave(octave - 1));

        for (let keyOctave = 0; keyOctave < 2; keyOctave++) {
            for (let i = 0; i < notes.length; i++) {
                let key = document.createElement('button');
                key.className = 'instrument-key ' + notesColors[i];
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
    }
}

const instrumentBuilder = new InstrumentBuilder();
const melodyWriter = new MelodyWriter();
const audioPanel = new AudioPanel(melodyWriter, instrumentBuilder);

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