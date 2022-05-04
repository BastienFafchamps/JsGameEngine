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

        this.mainGainNode = this.audioCtx.createGain();
        this.mainGainNode.gain.value = 0.2;
        this.mainGainNode.connect(this.audioCtx.destination);

        this.playingNotes = {};
    }

    setVolume(volume) {
        this.mainGainNode.gain.value = volume;
    }

    getInstument(instrumentData) {
        let previousNode = this.mainGainNode;
        let instrument = {
            nodes: [],
            oscillators: [],
        };

        instrumentData.node.forEach(nodeData => {
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

        instrument.playNote = (octave, note) => {
            instrument.oscillators.forEach(osc => {
                osc.playNote(octave, note);
            })
        };

        instrument.stopNote = () => {
            instrument.oscillators.forEach(osc => {
                osc.stop();
            })
        }

        return instrument;
    }

    playNote(instrument, octave, note) {
        let id = `${octave}-${note}`;

        if (this.playingNotes[id] != null) {
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

        let oscillatorNode = this.__createOscillatorNode({
            waveForm: instrument.waveForm,
            ...instrument.enveloppe
        });
        connect(oscillatorNode);
        oscillatorNode.playNote(octave, note);

        this.playingNotes[id] = { oscillatorNode: oscillatorNode, gainNode: null };
        return this.playingNotes[id];
    }

    stopNote(octave, note) {
        let id = `${octave}-${note}`;
        if (id in this.playingNotes && this.playingNotes[id]) {
            this.playingNotes[id].oscillatorNode.stopNote();
        }
    }

    __createOscillatorNode_obsolete(waveForm, release) {
        let osc = this.audioCtx.createOscillator();
        osc.type = waveForm;

        osc.playNote = (octave, note) => {
            if (octave <= 0) octave = 0.5;
            osc.frequency.value = this.FREQUENCIES[note] * (octave * 2);
            osc.start();
        }

        osc.stopNote = (releaseEnd) => {
            osc.stop(releaseEnd);
        }

        return osc;
    }

    __createGainEnveloppeNode_obsolete({ attack, decay, sustain, release }) {
        let gainNode = this.audioCtx.createGain();

        gainNode.start = () => {
            let now = this.audioCtx.currentTime;
            let attackEnd = now + attack;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, attackEnd);
            gainNode.gain.setTargetAtTime(sustain, attackEnd, decay);
        }

        gainNode.stop = () => {
            let now = this.audioCtx.currentTime;
            gainNode.gain.cancelScheduledValues(0);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + release);
        }

        gainNode.cancel = () => {
            gainNode.gain.cancelScheduledValues(0);
        }
        return gainNode;
    }

    __createOscillatorNode({ waveForm, attack, decay, sustain, release }) {
        let gainNode = this.audioCtx.createGain();
        gainNode.start = () => {
            let now = this.audioCtx.currentTime;
            let attackEnd = now + attack;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, attackEnd);
            gainNode.gain.setTargetAtTime(sustain, attackEnd, decay);
        }
        gainNode.stop = () => {
            let now = this.audioCtx.currentTime;
            gainNode.gain.cancelScheduledValues(0);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + release);
        }
        gainNode.cancel = () => {
            gainNode.gain.cancelScheduledValues(0);
        }

        let osc = this.audioCtx.createOscillator();
        osc.type = waveForm;
        osc.gainNode = gainNode;

        osc.playNote = (octave, note) => {
            if (octave <= 0) octave = 0.5;
            osc.frequency.value = this.FREQUENCIES[note] * (octave * 2);
            osc.start();
            gainNode.start();
        }
        osc.stopNote = () => {
            let now = this.audioCtx.currentTime;
            gainNode.stop();
            osc.stop(now + release);
        }
        osc.cancel = () => {
            gainNode.cancel();
        }

        osc.connect(gainNode);
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

export class Engine {

    constructor(renderer, inputManager, sprites, audioPlayer) {
        this.renderer = renderer;
        this.inputManager = inputManager;
        this.audioPlayer = audioPlayer;
        this.gameLoop = null;
        this.objects_img = [];
        this.entities = [];
        this.sprites = sprites;
        this.mousePos = renderer.mousePos;
    }

    setup(sprites) {
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
        console.log(this.mousePos, rect);
        return true;
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