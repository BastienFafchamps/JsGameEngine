import HtmlInputManager from "../engine/html/inputManager";
import HtmlRenderer from "../engine/html/renderer";
import Engine from "../engine/engine";

const canvas = document.getElementById("main-canvas");

const renderer = new HtmlRenderer(canvas);
// renderer.canvas.width = 128
// renderer.canvas.height = 96
// renderer.upscaleCanvas(128 * 4, 96 * 4);
// renderer.setCripsPixel();

const engine = new Engine(renderer, null);
const inputManager = new HtmlInputManager(document);