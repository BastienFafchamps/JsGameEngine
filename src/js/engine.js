import { EngineCore, HtmlInputManager, HtmlRenderer, Physics2D, HtmlSynth } from "./core.js";

String.prototype.replaceAt = function (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

export class Engine {

    constructor(canvas) {
        this.SPRITE_SIZE = 8;
        this.SPRITE_COUNT = 16;

        this.GameData = {};

        this.CANVAS = canvas;
        this.CANVAS.width /= 12;
        this.CANVAS.height /= 12;

        this.RENDERER = new HtmlRenderer(this.CANVAS);
        this.RENDERER.setCripsPixel();

        this.INPUT_MANAGER = new HtmlInputManager(document);
        this.AUDIO_PLAYER = new HtmlSynth(new AudioContext());
        this.PHYSICS = new Physics2D();

        this.CORE = new EngineCore(this.RENDERER, this.INPUT_MANAGER, this.AUDIO_PLAYER);

        this.gameDataListener = [];

        this.context = {
            PRINT: {
                f: (a) => console.log(a),
            },
            SCREEN_WIDTH: {
                f: this.CANVAS.width
            },
            SCREEN_HEIGHT: {
                f: this.CANVAS.height
            },
            MOUSE_POS: {
                f: this.CORE.mousePos
            },
            STOP: {
                f: () => this.CORE.stop(),
                description: 'Stops the engine',
            },
            DRAW_RECT: {
                f: (x, y, width, height, color) => this.CORE.drawRect(x, y, width, height, color),
                description: 'Draws a rectangle to the screen',
            },
            DRAW_CIRCLE: {
                f: (x, y, radius, color) => this.CORE.drawElipse(x, y, radius, color),
                description: 'Draws a circle to the screen',
            },
            DRAW_PIXEL: {
                f: (x, y, color) => this.CORE.drawPixel(x, y, color),
                description: 'Draws a pixel at a specific position',
            },
            TEXT: {
                f: (text, x, y, size, color) => this.CORE.drawText(text, x, y, size, color),
                description: 'Draws a pixel at a specific position',
            },
            SET_BACKGROUND: {
                f: (color) => this.CORE.setBackgroundColor(color),
                description: 'Draws a pixel at a specific position',
            },
            KEY_DOWN: {
                f: (key) => this.CORE.isKeyDown(key),
                description: 'Returns true if a key is pressed down',
            },
            KEY_PRESSED: {
                f: (key) => this.CORE.isKeyPressed(key),
                description: 'Returns true if a key has been pressed down',
            },
            KEY_UP: {
                f: (key) => this.CORE.isKeyUp(key),
                description: 'Stops the engine',
            },
            CREATE_RECT: {
                f: (obj = { x, y, width, height, color }) => this.CORE.createObjectRect(obj),
                description: 'Stops the engine',
            },
            CREATE_CIRCLE: {
                f: (obj = { x, y, width, height, color }) => this.CORE.createObjectCircle(obj),
                description: 'Stops the engine',
            },
            CREATE_SPRITE: {
                f: (obj = { x, y, spriteIndex }) => this.CORE.createObjectSprite(obj),
                description: 'Stops the engine',
            },
            REMOVE: {
                f: (obj = { x, y, width, height, color }) => this.CORE.deleteObject(obj),
                description: 'Stops the engine',
            },
            IS_MOUSE_OVER: {
                f: (rect) => this.CORE.isMouseOverRect(rect),
                description: 'Stops the engine',
            },
            DO_RECT_COLLIDES: {
                f: (rect_a, rect_b) => this.PHYSICS.doRectsCollides(rect_a, rect_b),
                description: 'Stops the engine',
            },
            DO_RECT_CIRCLE_COLLIDES: {
                f: (rect, circle) => this.PHYSICS.doRectCircleCollides(circle, rect),
                description: 'Stops the engine',
            },
            DO_CIRCLES_COLLIDES: {
                f: (circle_a, circle_b) => this.PHYSICS.doCirclesCollides(circle_a, circle_b),
                description: 'Stops the engine',
            },
            RANDOM: {
                f: () => this.CORE.random(),
                description: 'Stops the engine',
            },
            RANDOM_RANGE: {
                f: (min, max) => this.CORE.randomRange(min, max),
                description: 'Stops the engine',
            },
            PLAY_SOUND: {
                f: (id) => this.CORE.playSound(id),
                description: 'Plays a sound',
            },
            COLOR: {
                f: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
                description: 'Draws a rectangle to the screen',
            },
            COLOR_HSL: {
                f: (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`,
                description: 'Draws a rectangle to the screen',
            },
        }

        this.initGameData();
    }

    initGameData() {
        this.GameData.gameCode = '';

        this.GameData.palette = [
            '#ffffff',
            '#ff0000',
            '#00ff00',
            '#0000ff',
            '#ff00ff',
            '#ffff00',
            '#00ffff',
            '#aaaaaa',
            '#aabb2e',
        ],

            this.GameData.sprites = [];
        for (let i = 0; i < this.SPRITE_COUNT; i++) {
            this.GameData.sprites.push([]);
            for (let y = 0; y < this.SPRITE_SIZE; y++) {
                this.GameData.sprites[i].push("");
                for (let x = 0; x < this.SPRITE_SIZE; x++) {
                    this.GameData.sprites[i][y] += "-";
                }
            }
        }

        this.GameData.sounds = [
            {
                bpm: 120, volume: 0.8, melody: { notes: {}, beatCount: 8, },
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
            }
        ]
    }

    run() {
        try {
            this.CORE.setup(this.getSprites(), this.GameData.sounds);

            let gameContext = this.__getGameContext();
            let runCode = this.GameData.gameCode + "\nreturn [typeof UPDATE === 'function' ? UPDATE : undefined, typeof DRAW === 'function' ? DRAW : undefined];";
            let f = new Function(...Object.keys(gameContext), runCode);
            let [update_f, draw_f] = f(...Object.values(gameContext));

            // if (!update_f)
            //     throw (new Error('No "UPDATE" function found.'));
            if (update_f && !draw_f) {
                this.CORE.start(update_f, null);
            } if (update_f && draw_f) {
                this.CORE.start(update_f, draw_f);
            }
        } catch (error) {
            this.CORE.clear();
            console.warn("There are code errors, fix them before running the code", error);
        }
    }

    onGameDataUpdate() {
        this.gameDataListener.forEach(listener => listener(this.GameData));
    }

    addGameDataListener(listener) {
        this.gameDataListener.push(listener);
    }

    loadGameData(gameData) {
        if (gameData.settings != null)
            this.GameData.settings = gameData.settings;

        this.GameData.gameCode = gameData.gameCode;
        this.onGameDataUpdate();
    }

    setGameCode(gameCode) {
        this.GameData.gameCode = gameCode;
        this.onGameDataUpdate();
    }

    setPixel(spriteId, x, y, colorId) {
        let str = this.GameData.sprites[spriteId][y];
        this.GameData.sprites[spriteId][y] = str.substring(0, x) + colorId + str.substring(x + 1);
        this.onGameDataUpdate();
    }

    getSprites() {
        let images = [];
        for (let i = 0; i < this.GameData.sprite.length; i++) {
            images.push(this.getSpriteImg(i));
        }
        return images;
    }

    getPalette() {
        return this.GameData.palette;
    }

    getSpriteImg(spriteId) {
        const __hexToRGB = (hex) => {
            let bigint = parseInt(hex.substring(1), 16);
            let r = (bigint >> 16) & 255;
            let g = (bigint >> 8) & 255;
            let b = bigint & 255;
            return [r, g, b, 255];
        }

        let sprite = this.GameData.sprites[spriteId];
        let imageData = new ImageData(this.SPRITE_SIZE, this.SPRITE_SIZE);

        for (let y = 0; y < sprite.length; y++) {
            for (let x = 0; x < sprite[y].length; x++) {
                let colorId = sprite[y][x] != '-' ? parseInt(sprite[y][x]) : -1;
                let [r, g, b, a] = colorId != -1 ? __hexToRGB(this.GameData.palette[colorId]) : [0, 0, 0, 0];
                let i = ((y * this.SPRITE_SIZE) + x) * 4;
                imageData.data[i + 0] = r;
                imageData.data[i + 1] = g;
                imageData.data[i + 2] = b;
                imageData.data[i + 3] = a;
            }
        }
        return imageData;
    }

    __getGameContext() {
        Array.prototype.add = function (obj) {
            return this.push(obj);
        };

        let gameContext = {};
        Object.keys(this.context).forEach(key => {
            gameContext[key] = this.context[key].f;
        });
        return gameContext;
    }
}

export class SpritesManager {

    constructor(palette, spritesCount, spriteSize = 8) {
        this.sprites = [];
        this.imageDatas = [];
        this.spriteSize = spriteSize;
        this.palette = palette;

        for (let i = 0; i < spritesCount; i++) {
            this.sprites.push(this.__createEmptySprite());
            this.imageDatas.push(new ImageData(this.spriteSize, this.spriteSize));
        }
    }

    loadSprites(sprites) {
        this.__setSprites(sprites);
    }

    getSprite(spriteId) {
        return this.sprites[spriteId];
    }

    getSpriteImg(spriteId) {
        return this.imageDatas[spriteId];
    }

    getPalette() {
        return palette;
    }

    setPalette(palette) {
        this.palette = palette;
    }

    setPixel(spriteId, x, y, colorId) {
        console.log("set px");
        this.sprites[spriteId][y].replaceAt(x, colorId);

        let [r, g, b, a] = colorId != -1 ? this.__hexToRGB(this.palette[colorId]) : [0, 0, 0, 0];
        let i = ((y * this.spriteSize) + x) * 4;
        this.imageDatas[spriteId][i + 0] = r;
        this.imageDatas[spriteId][i + 1] = g;
        this.imageDatas[spriteId][i + 2] = b;
        this.imageDatas[spriteId][i + 3] = a;
    }

    __createEmptySprite() {
        let sprite = [];
        for (let i = 0; i < this.spriteSize; i++) {
            sprite.push("");
            for (let j = 0; j < this.spriteSize; j++) {
                sprite[i] += "-";
            }
        }
        return sprite;
    }

    __hexToRGB(hex) {
        let bigint = parseInt(hex.substring(1), 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return [r, g, b, 255];
    }
}