import HtmlInputManager from "./engine/html/inputManager";
import HtmlRenderer from "./engine/html/renderer";
import Engine from "./engine/engine";

const canvas = document.getElementById("main-canvas");
canvas.style.backgroundColor = 'rgba(255, 255, 255)';

const renderer = new HtmlRenderer(canvas);
const engine = new Engine(renderer, null);
const inputManager = new HtmlInputManager(document);

function run(code) {
    try {
        engine.clear();
        let f = new Function('engine', 'inputManager', 'canvas', code);
        f.call(this, engine, inputManager, canvas);
    } catch (error) {
        console.warn("There are code errors, fix them before running the code", error);
    }
}

window.run = run;