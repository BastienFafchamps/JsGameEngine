import { HtmlInputManager, HtmlRenderer, Engine, Physics2D } from "./c_engine.js";

export class App {

    constructor(canvas) {
        this.CANVAS = canvas;

        this.CANVAS.style.width = this.CANVAS.width + "px";
        this.CANVAS.style.height = this.CANVAS.height + "px";

        this.CANVAS.width /= 12;
        this.CANVAS.height /= 12;

        this.RENDERER = new HtmlRenderer(this.CANVAS);
        this.RENDERER.setCripsPixel();

        this.INPUT_MANAGER = new HtmlInputManager(document);
        this.PHYSICS = new Physics2D();
        this.ENGINE = new Engine(this.RENDERER, this.INPUT_MANAGER, null);

        this.onGameDataUpdate = (gameData) => { };

        this.GameData = {
            gameCode: '',
            palette: [
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
            sprites: this.__initSprites(16, 8),
        };

        this.context = {
            SCREEN_WIDTH: {
                value: this.CANVAS.width,
                description: 'The screen\'s width',
                type: 'value',
            },
            SCREEN_HEIGHT: {
                value: this.CANVAS.height,
                description: 'The screen\'s height',
                type: 'value',
            },
            STOP: {
                value: () => this.ENGINE.stop(),
                description: 'Stops the engine',
                type: 'function',
            },
            DRAW_RECT: {
                value: (x, y, width, height, color) => this.ENGINE.drawRect(x, y, width, height, color),
                description: 'Draws a rectangle to the screen',
                type: 'function',
            },
            DRAW_CIRCLE: {
                value: (x, y, radius, color) => this.ENGINE.drawElipse(x, y, radius, color),
                description: 'Draws a circle to the screen',
                type: 'function',
            },
            DRAW_PX: {
                value: (x, y, color) => this.ENGINE.drawPixel(x, y, color),
                description: 'Draws a pixel at a specific position',
                type: 'function',
            },
            SET_BACKGROUND: {
                value: (color) => this.ENGINE.setBackgroundColor(color),
                type: 'function',
            },
            KEY_DOWN: {
                value: (key) => this.ENGINE.isKeyDown(key),
                description: 'Returns true if a key is pressed down',
            },
            KEY_PRESSED: {
                value: (key) => this.ENGINE.isKeyPressed(key),
                description: 'Returns true if a key has been pressed down',
            },
            KEY_UP: {
                value: (key) => this.ENGINE.isKeyUp(key),
                description: 'Stops the engine',
            },
            CREATE_SPRITE: {
                value: (obj = { x, y, spriteIndex }) => this.ENGINE.createObjectSprite(obj),
            },
            CREATE_RECT: {
                value: (obj = { x, y, width, height, color }) => this.ENGINE.createObjectRect(obj),
                description: 'Stops the engine',
            },
            CREATE_CIRCLE: {
                value: (obj = { x, y, width, height, color }) => this.ENGINE.createObjectCircle(obj),
                description: 'Stops the engine',
            },
            REMOVE: {
                value: (obj = { x, y, width, height, color }) => this.ENGINE.deleteObject(obj),
                description: 'Stops the engine',
            },
            DO_RECT_COLLIDES: {
                value: (rect_a, rect_b) => this.PHYSICS.doRectsCollides(rect_a, rect_b),
                description: 'Stops the engine',
            },
            DO_RECT_CIRCLE_COLLIDES: {
                value: (rect, circle) => this.PHYSICS.doRectCircleCollides(circle, rect),
                description: 'Stops the engine',
            },
            DO_CIRCLES_COLLIDES: {
                value: (circle_a, circle_b) => this.PHYSICS.doCirclesCollides(circle_a, circle_b),
                description: 'Stops the engine',
            },
            RANDOM: {
                value: () => this.ENGINE.random(),
                description: 'Stops the engine',
            },
            RANDOM_RANGE: {
                value: (min, max) => this.ENGINE.randomRange(min, max),
                description: 'Stops the engine',
            },
            COLOR: {
                value: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
            },
            COLOR_HSL: {
                value: (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`,
            }
        };
    }

    run() {
        try {
            console.log(this.GameData);
            this.ENGINE.init(this.GameData.sprites);

            let gameContext = this.__buildGameContext(this.context);
            let runCode = this.GameData.gameCode + "\nreturn [typeof UPDATE === 'function' ? UPDATE : undefined, typeof DRAW === 'function' ? DRAW : undefined];";

            let f = new Function(...Object.keys(gameContext), runCode);
            let [update_f, draw_f] = f(...Object.values(gameContext));

            // if (!update_f)
            //     throw (new Error('No "UPDATE" function found.'));
            if (update_f && !draw_f) {
                this.ENGINE.start(update_f, null);
            } else if (!update_f && draw_f) {
                this.ENGINE.start(null, draw_f);
            } else if (update_f && draw_f) {
                this.ENGINE.start(update_f, draw_f);
            }
        } catch (error) {
            this.ENGINE.clear();
            console.warn("There are code errors, fix them before running the code", error);
        }
    }

    updatedGameData() {
        this.onGameDataUpdate(this.GameData);
    }

    setGameCode(gameCode) {
        this.GameData.gameCode = gameCode;
        this.updatedGameData();
    }

    loadGameData(gameData) {
        if (gameData.settings != null)
            this.GameData.settings = gameData.settings;
        this.GameData.gameCode = gameData.gameCode;
    }

    getSprite(index) {
        if (index < 0 || index > this.GameData.sprites.length) return null;
        return this.GameData.sprites[index];
    }

    setSprite(index, sprite) {
        if (index < 0 || index > this.GameData.sprites.length) return null;
        this.GameData.sprites[index] = sprite;
    }

    __buildGameContext(context) {
        let gameContext = {};
        for (let [key, variable] of Object.entries(context)) {
            gameContext[key] = variable.value;
        }
        return gameContext;
    }

    __initSprites(spriteCount, spriteSize) {
        let sprites = [];
        for (let i = 0; i < spriteCount; i++) {
            let sprite = new ImageData(spriteSize, spriteSize);
            sprites.push(sprite);
        }
        return sprites;
    }
}