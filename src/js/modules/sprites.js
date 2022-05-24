import { APP, createElement, addEventListener } from "../main.js";

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