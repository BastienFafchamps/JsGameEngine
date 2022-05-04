import { HtmlInputManager, HtmlRenderer, Engine, Physics2D } from "./engine.js";

export class App {

    constructor(canvas) {

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
        }

        this.CANVAS = canvas;

        this.CANVAS.style.width = this.CANVAS.width + "px";
        this.CANVAS.style.height = this.CANVAS.height + "px";

        this.CANVAS.width /= 12;
        this.CANVAS.height /= 12;

        this.RENDERER = new HtmlRenderer(this.CANVAS);
        this.RENDERER.setCripsPixel();

        this.SPRITE_MANAGER = new SpritesManager(this.GameData.palette, 16, 8);
        this.GameData.sprites = this.SPRITE_MANAGER.sprites;

        this.INPUT_MANAGER = new HtmlInputManager(document);
        this.PHYSICS = new Physics2D();

        this.ENGINE = new Engine(this.RENDERER, this.INPUT_MANAGER, null, this.SPRITE_MANAGER);

        this.onGameDataUpdate = (gameData) => {};

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
                f: this.ENGINE.mousePos
            },
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
            DRAW_PIXEL: {
                f: (x, y, color) => this.ENGINE.drawPixel(x, y, color),
                description: 'Draws a pixel at a specific position',
            },
            TEXT: {
                f: (text, x, y, size, color) => this.ENGINE.drawText(text, x, y, size, color),
                description: 'Draws a pixel at a specific position',
            },
            SET_BACKGROUND: {
                f: (color) => this.ENGINE.setBackgroundColor(color),
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
            CREATE_SPRITE: {
                f: (obj = { x, y, spriteIndex }) => this.ENGINE.createObjectSprite(obj),
                description: 'Stops the engine',
            },
            REMOVE: {
                f: (obj = { x, y, width, height, color }) => this.ENGINE.deleteObject(obj),
                description: 'Stops the engine',
            },
            IS_MOUSE_OVER: {
                f: (rect) => this.ENGINE.isMouseOverRect(rect),
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
            COLOR: {
                f: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
                description: 'Draws a rectangle to the screen',
            },
            COLOR_HSL: {
                f:  (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`,
                description: 'Draws a rectangle to the screen',
            },
        }
    }

    run() {
        try {
            this.ENGINE.setup(this.SPRITE_MANAGER.imageDatas);
    
            let gameContext = this.__getGameContext();
            let runCode = this.GameData.gameCode + "\nreturn [typeof UPDATE === 'function' ? UPDATE : undefined, typeof DRAW === 'function' ? DRAW : undefined];";
            let f = new Function(...Object.keys(gameContext), runCode);
            let [update_f, draw_f] = f(...Object.values(gameContext));
    
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

    getSpriteImg(spriteId) {
        return this.SPRITE_MANAGER.getSpriteImg(spriteId);
    }

    getPalette() {
        return this.SPRITE_MANAGER.getPalette();
    }

    setPixel(spriteId, x, y, colorId) {
        console.log(spriteId, x, y, colorId);
        this.SPRITE_MANAGER.setPixel(spriteId, x, y, colorId);
        this.updatedGameData();
    }

    __getGameContext() {
        Array.prototype.add = function(obj) {
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
        this.sprites[spriteId][y][x] = colorId;

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
            sprite.push([]);
            for (let j = 0; j < this.spriteSize; j++) {
                sprite[i].push(-1);
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

    __setSprites(sprites) {
        sprites.forEach((sprite, index) => {
           for (let y = 0; y < this.spriteSize; y++) {
               for (let x = 0; x < this.spriteSize; x++) {
                   this.setPixel(index, x, y, sprite[y][x]);
               }
           } 
        });
    }
}