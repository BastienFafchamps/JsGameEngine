import { Engine } from "./engine.js";

// ==================================== UTIL =============================================
export function addEventListener(id, type, method) {
    document.getElementById(id).addEventListener(type, method);
}

export function createElement(tag, data, parent = null) {
    let el = document.createElement(tag);
    for (let key in data) {
        el[key] = data[key];
    }

    if (parent != null)
        parent.appendChild(el);

    return el;
}

let templateGame = `
SET_BACKGROUND('black');

let pixels = [];
let particles = [];
let blocks = [];
let lives = 3;
let score = 0;
let speed = 0.5;
let gameOver = false;

function spawnParticles(x, y) {
	for (let i=0; i < 25; i++) {
		particles.push({
			x: x,
			y: y,
			dx: RANDOM_RANGE(-1, 0),
			dy: RANDOM_RANGE(-0.5, 0.5),
		});
	}
}

let timer = 0;
function UPDATE() {
	if (lives <= 0) {
		gameOver = true;
	}

	timer++;
  
	if (gameOver == false) {
		score += 0.1;
  	speed += 0.0001;
	}

	if (timer > 20) {
		timer = 0;

		blocks.push({
			speed: speed,
			x: SCREEN_WIDTH,
			y: Math.round(RANDOM_RANGE(0, SCREEN_HEIGHT)),
			width: 3,
			height: 3,
		});
	}

	blocks = blocks.filter(b => {
		b.x -= b.speed;

		if (gameOver == false && IS_MOUSE_OVER(b)) {
			lives--;
			spawnParticles(b.x, b.y);
			return false;
		}
		return b.x > 0;
	});

	particles = particles.filter(p => {
		p.x += p.dx;
		p.y += p.dy;
		p.dy += 0.02;
		return p.x >= 0 && p.y <= SCREEN_HEIGHT;
	});

	pixels = pixels.filter(px => {
		px.x -= 0.5;
		px.y += px.d;
		return px.x >= 0;
	});

	if (gameOver == false)
		pixels.push({x: MOUSE_POS.x, y: MOUSE_POS.y, d: RANDOM_RANGE(-0.1, 0.1)});
}

let i = 0;
function DRAW() {
	blocks.forEach(b => {
		DRAW_RECT(b.x, b.y, b.width, b.height, "red");
	})

	particles.forEach(p => {
		DRAW_PIXEL(p.x, p.y, 'red');
	})
	
	if (gameOver) {
  	TEXT('GAME OVER', SCREEN_WIDTH / 2 - 17, SCREEN_HEIGHT / 2 - 3, 15, 'white');
		TEXT(lives.toString(), SCREEN_WIDTH / 2 - 3, SCREEN_HEIGHT / 2 + 5, 15, 'white');
	} else {
		TEXT(lives.toString(), 1, 1, 15, 'white');
	}

	i += 0.1 % 60;
	for (let j=0; j < pixels.length; j++) {
		let color = COLOR_HSL((j + i % 40) / 40 * 360, 100, 50);
		DRAW_PIXEL(pixels[j].x, pixels[j].y, color);
	}
}
`;

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

    let gameData = null;
    try {
        let gameData = JSON.parse(sessionStorage.getItem('gameData'));
    } catch (error) {
        console.warn('Error trying to load session gameData', error);
    }

    if (gameData != null) {
        APP.loadGameData(gameData);
    } else {
        APP.loadGameData({ gameCode: templateGame });
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
            this.buttons[i].classList.remove("active");
        }
        this.activeTab = [...this.panels].findIndex(t => t.id == id);
        document.getElementById(id).classList.add("active");
        button.classList.add("active");
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