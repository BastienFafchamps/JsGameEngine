
export default class HtmlRenderer {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        // this.canvas = document.createElement('canvas');
        // this.ctx = new CanvasRenderingContext2D();
    }

    upscaleCanvas(width, height) {
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    setCripsPixel() {
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = '-webkit-crisp-edges';
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = 'crisp-edges';
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawPixel(x, y, color) {
        this.ctx.beginPath();
        this.ctx.rect(x, y, 1, 1);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawImage(x, y, image) {
        this.ctx.drawImage(image, x, y);
    }

    drawRect(x, y, width, height, color) {
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawEclipse(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }
}