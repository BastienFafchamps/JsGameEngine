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

        this.onGameDataUpdate = (gameData) => {};

        this.GameData = {
            settings: {
                backgroundColor: 'rgb(0, 0, 0)',
                frameRate: 24,
            },
            gameCode: '',
            sprites: this.__initSprites(16, 8),
        }

        this.context = {
            SCREEN_WIDTH: this.CANVAS.width,
            SCREEN_HEIGHT: this.CANVAS.height,
            STOP: () => this.ENGINE.stop(),
            DRAW_RECT: (x, y, width, height, color) => this.ENGINE.drawRect(x, y, width, height, color),
            DRAW_PX: (x, y, color) => this.ENGINE.drawPixel(x, y, color),
            DRAW_CIRCLE: (x, y, radius, color) => this.ENGINE.drawElipse(x, y, radius, color),
            KEY_DOWN: (key) => this.ENGINE.isKeyDown(key),
            KEY_PRESSED: (key) => this.ENGINE.isKeyPressed(key),
            KEY_UP: (key) => this.ENGINE.isKeyUp(key),
            CREATE_SPRITE: (obj = { x, y, spriteIndex }) => this.ENGINE.createObjectSprite(obj),
            CREATE_RECT: (obj = { x, y, width, height, color }) => this.ENGINE.createObjectRect(obj),
            CREATE_CIRCLE: (obj = { x, y, width, height, color }) => this.ENGINE.createObjectCircle(obj),
            REMOVE: (obj = { x, y, width, height, color }) => this.ENGINE.deleteObject(obj),
            DO_RECT_COLLIDES: (rect_a, rect_b) => this.PHYSICS.doRectsCollides(rect_a, rect_b),
            DO_RECT_CIRCLE_COLLIDES: (rect, circle) => this.PHYSICS.doRectCircleCollides(circle, rect),
            DO_CIRCLES_COLLIDES: (circle_a, circle_b) => this.PHYSICS.doCirclesCollides(circle_a, circle_b),
            RANDOM: () => this.ENGINE.random(),
            RANDOM_RANGE: (min, max) => this.ENGINE.randomRange(min, max),
        }

        this.contextDetails = {
            SCREEN_WIDTH: this.CANVAS.width,
            SCREEN_HEIGHT: this.CANVAS.height,
            STOP: {
                f: () => this.ENGINE.stop(),
                description: 'Stops the engine',
            },
            DRAW_RECT: {
                f: (x, y, width, height, color) => this.ENGINE.drawRect(x, y, width, height, color),
                description: 'Draws a rectangle to the screen',
            },
            DRAW_CIRCLE: {
                f: (x, y, radius, color) => this.ENGINE.drawElipse(x, y, radius, color),
                description: 'Draws a circle to the screen',
            },
            DRAW_PX: {
                f: (x, y, color) => this.ENGINE.drawPixel(x, y, color),
                description: 'Draws a pixel at a specific position',
            },
            KEY_DOWN: {
                f: (key) => this.ENGINE.isKeyDown(key),
                description: 'Returns true if a key is pressed down',
            },
            KEY_PRESSED: {
                f: (key) => this.ENGINE.isKeyPressed(key),
                description: 'Returns true if a key has been pressed down',
            },
            KEY_UP: {
                f: (key) => this.ENGINE.isKeyUp(key),
                description: 'Stops the engine',
            },
            CREATE_RECT: {
                f: (obj = { x, y, width, height, color }) => this.ENGINE.createObjectRect(obj),
                description: 'Stops the engine',
            },
            CREATE_CIRCLE: {
                f: (obj = { x, y, width, height, color }) => this.ENGINE.createObjectCircle(obj),
                description: 'Stops the engine',
            },
            REMOVE: {
                f: (obj = { x, y, width, height, color }) => this.ENGINE.deleteObject(obj),
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
                f: () => this.ENGINE.random(),
                description: 'Stops the engine',
            },
            RANDOM_RANGE: {
                f: (min, max) => this.ENGINE.randomRange(min, max),
                description: 'Stops the engine',
            },
        }
    }

    run() {
        try {
            this.CANVAS.style.backgroundColor = this.GameData.settings.backgroundColor;
            console.log(this.GameData);

            this.ENGINE.init(this.GameData.sprites);
    
            let runCode = this.GameData.gameCode + "\nreturn [typeof UPDATE === 'function' ? UPDATE : undefined, typeof DRAW === 'function' ? DRAW : undefined];";
    
            let f = new Function(...Object.keys(this.context), runCode);
            let [update_f, draw_f] = f(...Object.values(this.context));
    
            if (!update_f)
                throw (new Error('No "UPDATE" function found.'));
            if (update_f && !draw_f) {
                this.ENGINE.start(update_f, null);
            } if (update_f && draw_f) {
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
        if (index <= 0 || index > this.GameData.sprites.length) return null;
        return this.GameData.sprites[index];
    }

    setSprite(index, sprite) {
        if (index <= 0 || index > this.GameData.sprites.length) return null;
        this.GameData.sprites[index] = sprite;
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

// const CANVAS = document.getElementById("main-canvas");

// const canvasContainer = document.getElementById("game-view");
// window.onresize = () => {
//     if (canvasContainer == null) return;
//     CANVAS.width = canvasContainer.clientWidth;
//     CANVAS.height = canvasContainer.clientHeight;
// }

// const RENDERER = new HtmlRenderer(CANVAS);
// const INPUT_MANAGER = new HtmlInputManager(document);
// const PHYSICS = new Physics2D();
// const ENGINE = new Engine(RENDERER, INPUT_MANAGER, null);

// export const GameData = {
//     settings: {
//         color: 'rgb(0, 0, 0)',
//         frameRate: 24,
//     },
//     code: '',
// }

// const context = {
//     SCREEN_WIDTH: CANVAS.width,
//     SCREEN_HEIGHT: CANVAS.height,
//     STOP: () => ENGINE.stop(),
//     DRAW_RECT: (x, y, width, height, color) => ENGINE.drawRect(x, y, width, height, color),
//     DRAW_PX: (x, y, color) => ENGINE.drawPixel(x, y, color),
//     DRAW_CIRCLE: (x, y, radius, color) => ENGINE.drawElipse(x, y, radius, color),
//     KEY_DOWN: (key) => ENGINE.isKeyDown(key),
//     KEY_PRESSED: (key) => ENGINE.isKeyPressed(key),
//     KEY_UP: (key) => ENGINE.isKeyUp(key),
//     CREATE_RECT: (obj = { x, y, width, height, color }) => ENGINE.createObjectRect(obj),
//     CREATE_CIRCLE: (obj = { x, y, width, height, color }) => ENGINE.createObjectCircle(obj),
//     REMOVE: (obj = { x, y, width, height, color }) => ENGINE.deleteObject(obj),
//     DO_RECT_COLLIDES: (rect_a, rect_b) => PHYSICS.doRectsCollides(rect_a, rect_b),
//     DO_RECT_CIRCLE_COLLIDES: (rect, circle) => PHYSICS.doRectCircleCollides(circle, rect),
//     DO_CIRCLES_COLLIDES: (circle_a, circle_b) => PHYSICS.doCirclesCollides(circle_a, circle_b),
//     RANDOM: () => ENGINE.random(),
//     RANDOM_RANGE: (min, max) => ENGINE.randomRange(min, max),
// }

// export function run(game_code) {
//     try {
//         GameData.code = game_code;
//         CANVAS.style.backgroundColor = GameData.settings.color;
//         ENGINE.clear();

//         game_code = game_code + "\nreturn [typeof UPDATE === 'function' ? UPDATE : undefined, typeof DRAW === 'function' ? DRAW : undefined];";

//         let f = new Function(...Object.keys(context), game_code);
//         let [update_f, draw_f] = f(...Object.values(context));

//         if (!update_f)
//             throw (new Error('No "UPDATE" function found.'));
//         if (update_f && !draw_f) {
//             ENGINE.start(update_f, null);
//         } if (update_f && draw_f) {
//             ENGINE.start(update_f, draw_f);
//         }
//     } catch (error) {
//         ENGINE.clear();
//         console.warn("There are code errors, fix them before running the code", error);
//     }
// }

// export function reload() {
//     run(GameData.code);
// }

// export function loadGameData(gameData) {
//     if (gameData.settings != null)
//         GameData.settings = gameData.settings;
//     GameData.code = gameData.code;
//     reload();
// }

// document.getElementById("btn-reload").addEventListener('click', () => reload());