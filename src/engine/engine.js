
export default class Engine {

    constructor(renderer, audioPlayer) {
        this.renderer = renderer;
        this.audioPlayer = audioPlayer;
    }

    drawPixel(x, y, color) {
        this.renderer.drawPixel(x, y, color);
    }

    drawImage(x, y, image) {
        this.renderer.drawImage(image, x, y);
    }

    drawRect(x, y, width, height, color) {
        this.renderer.drawRect(x, y, width, height, color);
    }

    drawEclipse(x, y, radius, color) {
        this.renderer.drawEclipse(x, y, radius, color);
    }

    start(update, draw) {
        this.interval = setInterval(() => {
            update();
            this.renderer.clear();
            draw();
        }, 10);
    }

    stop() {
        clearInterval(this.interval); // Needed for Chrome to end game
    }
}