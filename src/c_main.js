import { HtmlInputManager, HtmlRenderer, Engine } from "./c_engine.js";

const CANVAS = document.getElementById("main-canvas");
export const settings = JSON.parse(sessionStorage.getItem('settings')) != null ? JSON.parse(sessionStorage.getItem('settings')) : {
    color: 'rgba(255, 255, 255)',
}

const canvasContainer = document.getElementById("game-view");
window.onresize = () => {
    if (canvasContainer == null) return;
    CANVAS.width = canvasContainer.clientWidth;
    CANVAS.height = canvasContainer.clientHeight;
}

const RENDERER = new HtmlRenderer(CANVAS);
const INPUT_MANAGER = new HtmlInputManager(document);
const ENGINE = new Engine(RENDERER, INPUT_MANAGER, null);

const context = {
    SCREEN_WIDTH: CANVAS.width,
    SCREEN_HEIGHT: CANVAS.height,
    STOP: () => ENGINE.stop(),
    DRAW_RECT: (x, y, width, height, color) => ENGINE.drawRect(x, y, width, height, color),
    DRAW_PX: (x, y, color) => ENGINE.drawPixel(x, y, color),
    DRAW_CIRCLE: (x, y, radius, color) => ENGINE.drawElipse(x, y, radius, color),
    KEY_DOWN: (key) => ENGINE.isKeyDown(key),
    KEY_PRESSED: (key) => ENGINE.isKeyPressed(key),
    KEY_UP: (key) => ENGINE.isKeyUp(key),
    CREATE_RECT: (obj = { x, y, width, height, color }) => ENGINE.createObjectRect(obj),
    CREATE_CIRCLE: (obj = { x, y, width, height, color }) => ENGINE.createObjectCircle(obj),
    REMOVE: (obj = { x, y, width, height, color }) => ENGINE.deleteObject(obj),
}

window.run = (game_code) => {
    try {
        sessionStorage.setItem('game-code', game_code);
        CANVAS.style.backgroundColor = settings.color;
        ENGINE.clear();

        game_code = game_code + "\nreturn [typeof UPDATE === 'function' ? UPDATE : undefined, typeof DRAW === 'function' ? DRAW : undefined];";

        let f = new Function(...Object.keys(context), game_code);
        let [update_f, draw_f] = f(...Object.values(context));

        if (!update_f)
            throw (new Error('No "UPDATE" function found.'));
        if (update_f && !draw_f) {
            // console.log('No "DRAW" function found.');
            ENGINE.start(update_f, null);
        } if (update_f && draw_f) {
            ENGINE.start(update_f, draw_f);
        }
    } catch (error) {
        ENGINE.clear();
        console.warn("There are code errors, fix them before running the code", error);
    }
}

window.reload = () => {
    run(sessionStorage.getItem('game-code'));
}
document.getElementById("btn-reload").addEventListener('click', () => reload());