import { APP, createElement, addEventListener } from "../main.js";

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

        this.instruments = APP.GameData.instruments;
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

        this.selectorContainer = document.getElementById('instrument-selector');
        this.setSelectors();

        this.container.innerHTML = '';

        this.inputVolume = document.getElementById('melody-volume');
        this.inputBpm = document.getElementById('melody-bpm');
        this.inputBeats = document.getElementById('melody-beats');

        this.inputVolume.addEventListener('input', event => {
            let min = 0, max = 1;
            this.instrument.volume = parseFloat(event.target.value) / 100.0 * max - min;
        });
    }

    setSelectors() {
        this.btns = [];
        for (let i = 0; i < 16; i++) {
            let btn = createElement('button', { className: 'audio-selector-btn', innerText: i });
            this.selectorContainer.appendChild(btn);
            this.btns.push(btn);

            btn.addEventListener('click', () => {
                this.selectInstrument(i);

                for (let j = 0; j < this.btns.length; j++)
                    this.btns[j].classList.remove('selected');
                this.btns[i].classList.add('selected');
            });
        }
    }

    selectInstrument(instrumentIndex) {
        if (APP.GameData.instruments[instrumentIndex] == null) {
            APP.GameData.instruments[instrumentIndex] = {
                nodes: [{
                    type: 'oscillator',
                    waveForm: 'sawtooth',
                    attack: 0.01,
                    decay: 0,
                    sustain: 1,
                    release: 1,
                }]
            };
        }

        this.instrument = APP.GameData.instruments[instrumentIndex];
        this.container.innerHTML = '';
        this.container.appendChild(createElement('button', { innerText: '+', className: 'instrument-add-node' }));
        this.instrument.nodes.forEach(node => {
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
        this.onMelodyChange = () => { };

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

        this.sounds = APP.GameData.melodies;
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
        if (APP.GameData.melodies[index] == null) {
            APP.GameData.melodies[index] = {
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

        this.selectedSound = APP.GameData.melodies[index];
        this.melodyWriter.setMelody(this.selectedSound.melody);

        for (let j = 0; j < this.btns.length; j++)
            this.btns[j].classList.remove('selected');
        this.btns[index].classList.add('selected');
    }

    setSelectors() {
        for (let i = 0; i < 16; i++) {
            let btn = createElement('button', { className: 'audio-selector-btn', innerText: i });
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