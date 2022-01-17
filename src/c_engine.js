export class HtmlInputManager {

    constructor(document) {
        this.keys = {};
        document.addEventListener("keydown", event => this.__keyDownHandler(this, event), false);
        document.addEventListener("keyup", event => this.__keyUpHandler(this, event), false);
        document.addEventListener("keypress", event => this.__keyPressedHandler(this, event), false);
    }

    isKeyDown(key) {
        return key in this.keys && this.keys[key] == 1;
    }

    isKeyPressed(key) {
        return key in this.keys && this.keys[key] == 2;
    }

    isKeyUp(key) {
        return !(key in this.keys);
    }

    __keyDownHandler(inputManager, event) {
        inputManager.keys[event.key] = 1;
    }

    __keyPressedHandler(inputManager, event) {
        inputManager.keys[event.key] = 2;
    }

    __keyUpHandler(inputManager, event) {
        if (event.key in inputManager.keys)
            delete inputManager.keys[event.key];
    }
}

export class HtmlRenderer {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    upscaleCanvas(width, height) {
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    setCripsPixel() {
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = '-webkit-crisp-edges';
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = 'crisp-edges';
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawPixel(x, y, color) {
        this.ctx.beginPath();
        this.ctx.rect(x, y, 1, 1);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawImage(x, y, image) {
        this.ctx.drawImage(image, x, y);
    }

    drawRect(x, y, width, height, color) {
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.fillStyle = color != null ? color : '#ff00fb';
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawEclipse(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color != null ? color : '#ff00fb';
        this.ctx.fill();
        this.ctx.closePath();
    }
}

export class Physics2D {

    constructor() {
    }

    doRectsCollides(rect_a, rect_b) {
        let a = { x1: rect_a.x, x2: rect_a.x + rect_a.width, y1: rect_a.y, y2: rect_a.y + rect_a.height };
        let b = { x1: rect_b.x, x2: rect_b.x + rect_b.width, y1: rect_b.y, y2: rect_b.y + rect_b.height };
        return this.contains(a, b) || this.overlaps(a, b);
    }

    // Check if rectangle a contains rectangle b
    contains(a, b) {
        return !(
            b.x1 < a.x1 ||
            b.y1 < a.y1 ||
            b.x2 > a.x2 ||
            b.y2 > a.y2
        );
    }

    // Check if rectangle a overlaps rectangle b
    overlaps(a, b) {
        // no horizontal overlap
        if (a.x1 >= b.x2 || b.x1 >= a.x2) return false;
        // no vertical overlap
        if (a.y1 >= b.y2 || b.y1 >= a.y2) return false;
        return true;
    }

    // Check if rectangle a touches rectangle b
    touches(a, b) {
        // has horizontal gap
        if (a.x1 > b.x2 || b.x1 > a.x2) return false;
        // has vertical gap
        if (a.y1 > b.y2 || b.y1 > a.y2) return false;
        return true;
    }

    doRectCircleCollides(circle, rect) {
        let x = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        let y = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        let dx = x - circle.x;
        let dy = y - circle.y;
        return (dx * dx + dy * dy) <= circle.radius * circle.radius;
    }

    doCirclesCollides(circle_a, circle_b) {
        let max = circle_a.radius + circle_b.radius;
        let dx = circle_a.x - circle_b.x;
        let dy = circle_a.y - circle_b.y;
        return ((dx * dx) + (dy * dy)) <= (max * max); 
    }
}

export class HtmlSynth {

    constructor() {}
}

export class Engine {

    constructor(renderer, inputManager, audioPlayer) {
        this.renderer = renderer;
        this.inputManager = inputManager;
        this.audioPlayer = audioPlayer;
        this.gameLoop = null;
        this.objects_img = [];
        this.entities = [];
    }

    clear() {
        if (this.gameLoop != null) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            this.objects_img = [];
            this.entities = [];
        }
        this.renderer.clear();
    }

    start(update, draw = null) {
        if (draw != null) {
            this.gameLoop = setInterval(() => {
                update();
                this.renderer.clear();
                this.__drawEntities();
                draw();
            }, 10);
        } else {
            this.gameLoop = setInterval(() => {
                update();
                this.renderer.clear();
                this.__drawEntities();
            }, 10);
        }
    }

    stop() {
        if (this.gameLoop != null) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    drawPixel(x, y, color) {
        this.renderer.drawPixel(x, y, color);
    }

    drawImage(x, y, image) {
        this.renderer.drawImage(image, x, y);
    }

    drawRect(x, y, width, height, color) {
        this.renderer.drawRect(x, y, width, height, color);
    }

    drawElipse(x, y, radius, color) {
        this.renderer.drawEclipse(x, y, radius, color);
    }

    isKeyDown(key) {
        return this.inputManager.isKeyDown(key);
    }

    isKeyPressed(key) {
        return this.inputManager.isKeyPressed(key);
    }

    isKeyUp(key) {
        return this.inputManager.isKeyUp(key);
    }

    random() {
        return Math.random();
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    createObjectRect(obj = { x, y, width, height, color }) {
        obj.__id = this.entities.length;
        obj.__type = 'rect';
        this.entities.push(obj);
        return obj;
    }

    createObjectCircle(obj = { x, y, radius, color }) {
        obj.__id = this.entities.length;
        obj.__type = 'elipse';
        this.entities.push(obj);
        return obj;
    }

    deleteObject(obj) {
        let i = this.entities.findIndex(e => e.__id == obj.__id);
        this.entities.splice(i, 1);
    }

    // ================= PRIVATE METHODS ================= 
    __drawEntities() {
        this.entities.forEach(obj => {
            if (obj.__type == 'rect')
                this.drawRect(obj.x, obj.y, obj.width, obj.height, obj.color);
            if (obj.__type == 'elipse')
                this.drawElipse(obj.x, obj.y, obj.radius, obj.color);
        });
    }
}