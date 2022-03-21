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

        this.mousePos = { x: 0, y: 0 };
        this.setupMousePosListening();
    }

    setupMousePosListening() {
        this.canvas.addEventListener('mousemove', event => {
            let rect = this.canvas.getBoundingClientRect();
            let scaleFactor = rect.width / this.canvas.width;
            this.mousePos.x = Math.floor((event.clientX - rect.left) / scaleFactor);
            this.mousePos.y = Math.floor((event.clientY - rect.top) / scaleFactor);
        });
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

    setBackgroundColor(color) {
        this.canvas.style.backgroundColor = color;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawPixel(x, y, color) {
        this.ctx.beginPath();
        this.ctx.rect(Math.round(x), Math.round(y), 1, 1);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawImage(x, y, image) {
        this.ctx.putImageData(image, x, y);
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

    constructor(audioContext) {
        this.WAVE_FORMS = ['sine', 'square', 'sawtooth', 'triangle'];
        this.FREQUENCIES = {
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
        };

        this.audioCtx = audioContext;
        this.eveloppeMaxTime = 1;

        this.mainGainNode = this.audioCtx.createGain();
        this.mainGainNode.gain.value = 0.2;
        this.mainGainNode.connect(this.audioCtx.destination);

        this.playingNotes = {};
    }
    
    setVolume(volume) {
        this.mainGainNode.gain.value = volume;
    }

    playNote(instrument, octave, note) {
        let id = `${octave}-${note}`;

        if (this.playingNotes[id] != null) {
            this.playingNotes[id].gainNode.cancel();
            this.playingNotes[id].oscillatorNode.stop();
        }

        let outputNode = this.mainGainNode;
        const connect = node => {
            node.connect(outputNode);
            outputNode = node;
        }

        if (instrument.filter != null && instrument.filter.type != 'none') {
            let filter = this.__createFilter(instrument.filter);
            connect(filter);
        }

        let gainEnveloppeNode = this.__createGainEnveloppeNode(instrument.enveloppe);
        connect(gainEnveloppeNode);

        let oscillatorNode = this.__createOscillatorNode(instrument.waveForm, instrument.enveloppe.release);
        connect(oscillatorNode);

        oscillatorNode.playNote(octave, note);
        gainEnveloppeNode.start();

        this.playingNotes[id] = { oscillatorNode: oscillatorNode, gainNode: gainEnveloppeNode };
        return this.playingNotes[id];
    }

    stopNote(octave, note) {
        let id = `${octave}-${note}`;
        if (id in this.playingNotes && this.playingNotes[id]) {
            this.playingNotes[id].gainNode.stop();
            this.playingNotes[id].oscillatorNode.stopNote();
        }
    }

    __createOscillatorNode(waveForm, release) {
        let osc = this.audioCtx.createOscillator();
        osc.type = waveForm;

        osc.playNote = (octave, note) => {
            if (octave <= 0) octave = 0.5;
            osc.frequency.value = this.FREQUENCIES[note] * (octave * 2);
            osc.start();
        }

        osc.stopNote = () => {
            let now = this.audioCtx.currentTime;
            let releaseDuration = release;
            let releaseEnd = now + releaseDuration;
            osc.stop(releaseEnd);
        }

        return osc;
    }

    __createGainEnveloppeNode({attack, decay, sustain, release}) {
        let gainNode = this.audioCtx.createGain();

        gainNode.start = () => {
            let now = this.audioCtx.currentTime;
            let attackEnd = now + attack;
            let decayDuration = decay;

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, attackEnd);
            gainNode.gain.setTargetAtTime(sustain, attackEnd, decayDuration);
        }

        gainNode.stop = () => {
            let now = this.audioCtx.currentTime;
            let releaseDuration = release;
            let releaseEnd = now + releaseDuration;

            gainNode.gain.cancelScheduledValues(0);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, releaseEnd);
        }

        gainNode.cancel = () => {
            gainNode.gain.cancelScheduledValues(0);
        }
        return gainNode;
    }

    __createFilter({type, frequency, resonance}) {
        let filterNode = this.audioCtx.createBiquadFilter();
        filterNode.type = type;
        filterNode.frequency.value = frequency;
        filterNode.Q.value = resonance;
        return filterNode;
    }
}

export class SpritesManager {

    constructor(palette, spritesCount, spriteSize = 8) {
        this.sprites = [];
        this.spriteSize = spriteSize;
        this.palette = palette;
        for (let i = 0; i < spritesCount; i++) {
            this.sprites.push(-1);
        }
    }

    setPalette(palette) {
        this.palette = palette;
    }

    setPixel(palette) {
        this.palette = palette;
    }

    getImages() {
        let images = [];
        this.sprites.forEach(sprite => {
            let image = new ImageData(this.spriteSize, this.spriteSize);
            sprite.forEach(px => {
                if (px == -1) {

                } else {
                    // image.data[px]
                }
            })
            images.push(image);
        });
        return images;
    }
}

export class Engine {

    constructor(renderer, inputManager, audioPlayer) {
        this.renderer = renderer;
        this.inputManager = inputManager;
        this.audioPlayer = audioPlayer;
        this.gameLoop = null;
        this.objects_img = [];
        this.entities = [];
        this.sprites = [];
        this.mousePos = renderer.mousePos;
    }

    init(sprites) {
        this.sprites = sprites;
        this.clear();
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
        if (draw != null && update != null) {
            this.gameLoop = setInterval(() => {
                update();
                this.renderer.clear();
                this.__drawEntities();
                draw();
            }, 10);
        } else if (draw != null && update == null) { 
            this.gameLoop = setInterval(() => {
                this.renderer.clear();
                this.__drawEntities();
                draw();
            }, 10);
        } else if (update != null) {
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
        this.renderer.drawImage(x, y, image);
    }

    drawRect(x, y, width, height, color) {
        this.renderer.drawRect(x, y, width, height, color);
    }

    drawElipse(x, y, radius, color) {
        this.renderer.drawEclipse(x, y, radius, color);
    }

    setBackgroundColor(color) {
        this.renderer.setBackgroundColor(color);
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

    createObjectSprite(obj = { x, y, spriteIndex }) {
        obj.__id = this.entities.length;
        obj.__type = 'sprite';
        this.entities.push(obj);
        return obj;
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
            else if (obj.__type == 'elipse')
                this.drawElipse(obj.x, obj.y, obj.radius, obj.color);
            else if (obj.__type == 'sprite') {
                if (obj.spriteIndex >= 0 && obj.spriteIndex < this.sprites.length) {
                    this.drawImage(obj.x, obj.y, this.sprites[obj.spriteIndex])
                }
            }
        });
    }
}