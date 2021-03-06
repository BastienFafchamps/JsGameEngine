import { Engine } from "./engine.js";

// ==================================== UTIL =============================================
export const addEventListener = (id, type, method) => {
    document.getElementById(id).addEventListener(type, method);
}

export const createElement = (tag, data, parent = null) => {
    let el = document.createElement(tag);
    for (let key in data) {
        el[key] = data[key];
    }

    if (parent != null)
        parent.appendChild(el);

    return el;
}

export const createSpriteSrc = (pixels) => {
    let canvas = document.createElement('canvas');
    canvas.style.imageRendering = '-moz-crisp-edges';
    canvas.style.imageRendering = '-webkit-crisp-edges';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = 'crisp-edges';
    canvas.width = pixels.length;
    canvas.width = pixels[0].length;

    let ctx = canvas.getContext('2d');
    for (let y = 0; y < pixels.length; y++) {
        for (let x = 0; x < pixels[y].length; x++) {
            ctx.fillStyle = pixels[y][x] == "#" ? "#ffffff" : "#00000000";
            ctx.fillRect(x, y, 1, 1);
        }
    }
    return canvas.toDataURL();
}

// ==================================== APP =============================================
const CANVAS = document.getElementById("main-canvas");
const canvasContainer = document.getElementById("game-view");
export const APP = new Engine(CANVAS);

function INIT() {
    APP.addGameDataListener(gameData => {
        sessionStorage.setItem('gameData', JSON.stringify(gameData))
        console.log(gameData);
    });

    window.onresize = () => {
        if (canvasContainer == null || CANVAS == null) return;
        CANVAS.width = canvasContainer.clientWidth;
        CANVAS.height = canvasContainer.clientHeight;
    }

    addEventListener('btn-reload', 'click', () => APP.run());

    if (sessionStorage.getItem('gameData') != null) {
        let gameData = null;
        try {
            gameData = JSON.parse(sessionStorage.getItem('gameData'));
        } catch (error) {
            console.warn('Error trying to load session gameData', error);
        }

        if (gameData != null) {
            APP.loadGameData(gameData);
        }
    }

    console.log("Application initialized.");
}

// ==================================== TABS =============================================
class TabsManager {
    constructor() {
        this.panels = document.getElementsByClassName("tab-panel");
        this.buttons = document.getElementsByClassName("tab-btn");
        this.activeTab = 0;

        for (let i = 0; i < this.panels.length; i++)
            this.buttons[i].addEventListener('click', event => this.openTab(event.currentTarget, this.panels[i].id));

        if (sessionStorage.getItem('activeTab'))
            this.activeTab = sessionStorage.getItem('activeTab')
        this.openTab(this.buttons[this.activeTab], this.panels[this.activeTab].id);
    }

    openTab(button, id) {
        for (let i = 0; i < this.panels.length; i++) {
            this.panels[i].classList.remove("active");
            this.buttons[i].classList.remove("selected");
        }
        this.activeTab = [...this.panels].findIndex(t => t.id == id);
        document.getElementById(id).classList.add("active");
        button.classList.add("selected");
        sessionStorage.setItem("activeTab", this.activeTab);
    }
}
const tabsManager = new TabsManager();

// ================================= Main ==========================================

class FileManager {
    constructor() {
        document.getElementById('download').addEventListener('click', () => this.download());
        // document.getElementById('load').addEventListener('change', event => this.onFileLoaded(event));
    }

    static getDownloadLink(filename, url) {
        let a = document.createElement('a');
        a.download = filename;
        a.href = url;

        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

    download() {
        let filename = 'game.json';
        let file = new Blob([JSON.stringify(APP.GameData)], { type: 'json' });
        if (window.navigator.msSaveOrOpenBlob)
            window.navigator.msSaveOrOpenBlob(file, filename);
        else {
            let url = URL.createObjectURL(file);
            FileManager.getDownloadLink(filename, url);
        }
    }

    onFileLoaded(event) {
        let reader = new FileReader();
        reader.readAsText(event.target.files[0], 'UTF-8');
        reader.onload = readerEvent => {
            let gameData = JSON.parse(readerEvent.target.result);
            APP.loadGameData(gameData);
            codeInput.innerHTML = gameData.gameCode;
            updateCode(gameData.gameCode);
        }
    }

    getHtmlExport() {
        if (_CORE == null)
            return "ERROR";
        let head = document.getElementsByTagName('head')[0].innerHTML;
        let js = _CORE.toString();
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
            ${head}
            <\/head>
            <body>
                <div class="tab-buttons">
                    <button class="btn tab-btn tab-push-btn contained" id="btn-reload"><img id="img-reload"></button>
                </div>
                <div id="game-view-panel" class="tab-panel">
                    <canvas id="main-canvas" width="840" height="580">
                        Your browser doesn't support WebGL, please use a more recent one.
                    </canvas>
                </div>
            <script type="text/javascript">
            _CORE = ${js}
            _CORE();
            <\/script>
            <\/body>
            <\/html>
        `;
        return html;
    }

    __download() {
        let filename = 'game.html';
        let file = new Blob([this.getHtmlExport()], { type: 'html' });
        if (window.navigator.msSaveOrOpenBlob)
            window.navigator.msSaveOrOpenBlob(file, filename);
        else {
            let url = URL.createObjectURL(file);
            FileManager.getDownloadLink(filename, url);
        }
    }
}
const fileManager = new FileManager();

class IconsManager {
    constructor() {
        document.getElementById('img-download').src = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAADxJREFUGJWNjsEKADAIQjX2/588dyloEmzvYmlIwA+SmCpJ6l74kc+BByt1m187q2FqiisgSQ9H+oMAcAATMRkCwVzv4QAAAABJRU5ErkJggg==";
        document.getElementById('img-reload').src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAADVJREFUGJWNj7kRADAMwsD7zwxp/SUXNT5AjYGEbaPByxAARJLRynxnWPIsfgS9BG1SoX90AB3SEAQibJqJAAAAAElFTkSuQmCC";
        document.getElementById('img-play').src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAD9JREFUGJV9jkEOACAIwzb+/2bnQTCwRJtwYVAgAEgiEpJCI1q4stCXwrd0YPXClc2Ga/gR/mSe5Bh4hQO3FBuVHR0I6LYF2QAAAABJRU5ErkJggg==";
        document.getElementById('img-code').src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAD9JREFUGJWFjkEKACAMw9L9/82rl6FTFHsZhJYMPhGAbQEJRPEEQpI30IZRbEFJvilmoTTvwivRbjZ+/rRyqgYXgBEKwAF1CgAAAABJRU5ErkJggg==";
        document.getElementById('img-sprites').src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAENJREFUGJWFjkEOADEIAhn//2bpZdtQ02S5IQhIP0CSbCOpv1sdEbxJx1MD1nQnbN8GgOGpnVqxoaaYCY6k3PPsv+oWAogWDC/DsEQAAAAASUVORK5CYII=";
        document.getElementById('img-instruments').src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAERJREFUGJVtj0EOACEQwlrj/58se9IQV06TAZogQBIpqdn3uMy1zf2fXEoSYBzCjVVt0qimFfZHANYr3IFj9gof+HThAwCqIg/RFJxfAAAAAElFTkSuQmCC";
        document.getElementById('img-melody').src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAADtJREFUGJWVj0EOACAIwzri/5/MvIgxXtBeFgohGTQIwLa2kFyzJMfyWbmWWS5o+DrIKwEYr582ZyOACWstFAAg+YsfAAAAAElFTkSuQmCC";
    }
}
const iconsManager = new IconsManager();

setTimeout(() => INIT(), 500);