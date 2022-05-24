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

export class FontUtil {
    constructor(context) {
        this.images = {};
        this.bitmap = {
            'a': [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
            'b': [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0],
            'c': [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
            'd': [0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
            'e': [0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0],
            'f': [0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0],
            'g': [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
            'h': [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0],
            'i': [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            'j': [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
            'k': [1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0],
            'l': [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            'm': [0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            'n': [0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0],
            'o': [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
            'p': [0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
            'q': [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1],
            'r': [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            's': [0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
            't': [0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0],
            'u': [0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
            'v': [0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0],
            'w': [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0],
            'x': [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
            'y': [0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0],
            'z': [0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0],
            'A': [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
            'B': [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0],
            'C': [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
            'D': [0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
            'E': [0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0],
            'F': [0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0],
            'G': [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
            'H': [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0],
            'I': [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            'J': [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
            'K': [1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0],
            'L': [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            'M': [0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            'N': [0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0],
            'O': [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
            'P': [0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
            'Q': [0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1],
            'R': [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            'S': [0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
            'T': [0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0],
            'U': [0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
            'V': [0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0],
            'W': [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0],
            'X': [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
            'Y': [0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0],
            'Z': [0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0],
            '0': [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0],
            '1': [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0],
            '2': [1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0],
            '3': [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0],
            '4': [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
            '5': [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
            '6': [0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            '7': [1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            '8': [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            '9': [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
            '-': [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            '+': [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0],
            '_': [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
            '/': [0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
            '.': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            ',': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
        }
        this.setImageDatas(context);
    }

    setImageDatas(context) {
        Object.keys(this.bitmap).forEach(char => {
            this.images[char] = this.__getImage(context, char);
        });
    }

    getImage(char) {
        return this.images[char];
    }

    __getImage(context, char) {
        let bitmap = this.bitmap[char];
        let imageData = context.createImageData(3, 5);
        let x = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i + 0] = 255;
            imageData.data[i + 1] = 255;
            imageData.data[i + 2] = 255;
            imageData.data[i + 3] = bitmap[x] == 1 ? 255 : 0;
            x++;
        }
        return imageData;
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

        this.fontUtil = new FontUtil(this.ctx);
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

    drawText(text, x, y, size, color) {
        for (let i = 0; i < text.length; i++) {
            let img = this.fontUtil.getImage(text[i]);
            if (img != null)
                this.drawImage(x + (4 * i), y, img);
        }
    }

    drawLine(x0, y0, x1, y1) {
        this.setPixel(x0, y0);
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

        const dx = x1 - x0;
        const dy = y1 - y0;
        const absdx = Math.abs(dx);
        const absdy = Math.abs(dy);

        // slope < 1
        if (absdx > absdy) {
            handle(x0, y0, dx, dy, absdx, absdy, (x, y) => this.setPixel(x, y));
        } else { // case when slope is greater than or equals to 1
            handle(y0, x0, dy, dx, absdy, absdx, (y, x) => this.setPixel(x, y));
        }
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
        this.FREQUENCIES = {
            'C': 16.35,
            'C#': 17.32,
            'D': 18.35,
            'E#': 19.45,
            'E': 20.60,
            'F': 21.83,
            'F#': 23.12,
            'G': 24.50,
            'G#': 25.96,
            'A': 27.50,
            'A#': 29.14,
            'B': 30.87,
        };

        this.audioCtx = audioContext;

        this.mainGainNode = this.audioCtx.createGain();
        this.mainGainNode.gain.value = 0.2;
        this.mainGainNode.connect(this.audioCtx.destination);

        this.playingNotes = {};
    }

    setVolume(volume) {
        this.mainGainNode.gain.value = volume;
    }

    playSound(sound) {
        this.playMelody(sound.melody, sound.instrument, sound.volume, sound.bpm);
    }

    playMelody(melody, instrument, volume, bpm) {
        let n = 1 / (bpm / 60);
        Object.values(melody.notes).forEach(note => {
            let time = n * Math.max(0.00000001, note.time);
            let length = n * note.length;
            this.getInstument(instrument).playNote(note.octave, note.key, time, length);
        });
    }

    getInstument(instrumentData) {
        let previousNode = this.mainGainNode;
        let instrument = {
            nodes: [],
            oscillators: [],
        };

        instrumentData.nodes.forEach(nodeData => {
            let node = null;

            if (nodeData.type == 'oscillator') {
                node = this.__createOscillatorNode(nodeData);
                instrument.oscillators.push(node);
            } else if (nodeData.type == 'filter') {
                node = this.__createFilter(nodeData);
            }

            instrument.nodes.push(node);

            if (previousNode != null)
                node.connect(previousNode)
            previousNode = node;
        });

        instrument.playNote = (octave, note, time, length) => {
            instrument.oscillators.forEach(osc => {
                osc.playNote(octave + 3, note, time, length);
            })
        };

        return instrument;
    }

    __createOscillatorNode({ waveForm, attack, decay, sustain, release }) {
        let gainNode = this.audioCtx.createGain();
        let osc = this.audioCtx.createOscillator();

        osc.playNote = (octave, note, time, length) => {
            if (octave <= 0) octave = 0.5;
            osc.frequency.value = this.FREQUENCIES[note] * (octave * 2);

            time = this.audioCtx.currentTime + time;

            gainNode.gain.cancelScheduledValues(time);
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(1, time + attack);
            // gainNode.gain.setTargetAtTime(sustain, time + attack, decay);

            // gainNode.gain.setValueAtTime(gainNode.gain.value, time + length);
            gainNode.gain.linearRampToValueAtTime(0, time + length + release);

            osc.start(time);
            osc.stop(time + length + release);
        }

        osc.type = waveForm;
        osc.gainNode = gainNode;
        osc.connect(gainNode);
        osc.connect = (node) => gainNode.connect(node);
        return osc;
    }

    __createFilter({ type, frequency, resonance }) {
        let filterNode = this.audioCtx.createBiquadFilter();
        filterNode.type = type;
        filterNode.frequency.value = frequency;
        filterNode.Q.value = resonance;
        return filterNode;
    }
}

export class EngineCore {

    constructor(renderer, inputManager, audioPlayer) {
        this.renderer = renderer;
        this.inputManager = inputManager;
        this.audioPlayer = audioPlayer;
        this.gameLoop = null;
        this.entities = [];
        this.sounds = [];
        this.sprites = [];
        this.mousePos = renderer.mousePos;

        this.isRunning = false;
        this.update = () => {};
        this.draw = () => {};

        this.previousTime = 0.0;
        const gameloop = (time) => {
            const deltaTime = time - this.previousTime;
            this.previousTime = time;

            if (this.isRunning) {
                this.update(deltaTime);
                this.renderer.clear();
                this.__drawEntities();
                this.draw();
            }
            window.requestAnimationFrame(gameloop);
        }

        window.requestAnimationFrame(time => {
            this.previousTime = time;
            window.requestAnimationFrame(gameloop);
        });
    }

    setup(sprites, sounds) {
        this.sprites = sprites;
        this.sounds = sounds;
        this.clear();
    }

    clear() {
        if (this.gameLoop != null) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            this.entities = [];
        }
        this.renderer.clear();
    }

    start(update, draw = null) {
        if (draw != null) {
            this.draw = draw;
        } else {
            this.draw = () => {};
        }

        if (update != null) {
            this.update = update;
        } else {
            this.update = () => {};
        }

        this.isRunning = true;
    }

    stop() {
        this.isRunning = false;
    }

    drawPixel(x, y, color) {
        this.renderer.drawPixel(x, y, color);
    }

    drawSprite(x, y, spriteId) {
        this.renderer.drawImage(x, y, this.sprites[spriteId]);
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

    drawText(text, x, y, size, color) {
        this.renderer.drawText(text, x, y, size, color);
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

    isMouseOverRect(rect) {
        if (this.mousePos.x < rect.x || this.mousePos.x > (rect.x + rect.width)) return false;
        if (this.mousePos.y < rect.y || this.mousePos.y > (rect.y + rect.height)) return false;
        return true;
    }

    playSound(id) {
        this.audioPlayer.playSound(this.sounds[id]);
    }

    // ================= PRIVATE METHODS ================= 
    __drawEntities() {
        this.entities.forEach(obj => {
            if (obj.__type == 'rect')
                this.drawRect(obj.x, obj.y, obj.width, obj.height, obj.color);
            else if (obj.__type == 'elipse')
                this.drawElipse(obj.x, obj.y, obj.radius, obj.color);
            else if (obj.__type == 'sprite') {
                this.drawImage(obj.x, obj.y, this.sprites[obj.spriteIndex])
            }
        });
    }
}