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

let ball = {
    radius: 10,
    x: 20,
    y: 60,
    dx: -0.5,
    dy: -0.5,
}

let paddle = {
    height: 20,
    width: 100,
    x: 10,
    speed: 1,
}

let brickWidth = 10;
let brickHeight = 5;
let brickPadding = 1;
let bricks = [];

let bricks_x_start = 3;
let bricks_y_start = 2;

for (let i = 0 + bricks_x_start; i < 10 + bricks_x_start; i++) {
    for (let j = 0 + bricks_y_start; j < 10 + bricks_y_start; j++) {
        bricks.push({x: brickWidth * i, y: brickHeight * j, life: 3});
    }
}

let colors = [
    "#ade4ff",
    "#48bef7",
    "#0095DD",
]

function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y < ball.radius || isBallOnPaddle())
        ball.dy = -ball.dy;
    else if(ball.y > canvas.height + ball.radius) {
        alert("GAME OVER");
        document.location.reload();
        engine.stop();
    }

    if (ball.x < ball.radius || ball.x + ball.radius > canvas.width)
        ball.dx = -ball.dx;

    if ((inputManager.isKeyDown('Right') || inputManager.isKeyDown('ArrowRight')) && paddle.x < canvas.width - paddle.width)
        paddle.x += paddle.speed;

    if ((inputManager.isKeyDown('Left') || inputManager.isKeyDown('ArrowLeft')) && paddle.x > 0)
        paddle.x -= paddle.speed;

    bricks = bricks.filter(brick => {
        if (ball.y > brick.y && ball.y < brick.y + brickHeight && ball.x > brick.x && ball.x < brick.x + brickWidth) {
            ball.dy = -ball.dy;
            brick.life -= 1;
            return brick.life > 0;
        }
        return true;
    });
}

function draw() {
    bricks.forEach(brick => {
        drawBrick(brick.x, brick.y, brickWidth, brickHeight, brickPadding, colors[brick.life - 1]);
    });

    engine.drawEclipse(ball.x, ball.y, ball.radius, "#0095DD");
    engine.drawRect(paddle.x, canvas.height - paddle.height - 5, paddle.width, paddle.height, "#0095DD");
}

function drawBrick(x, y, width, height, padding, color) {
    engine.drawRect(x + padding, y + padding, width - (2 * padding), height - (2 * padding), color);
}

function isBallOnPaddle() {
    return ball.y + ball.radius > canvas.height - paddle.height - 5 && ball.x > paddle.x && ball.x < paddle.x + paddle.width;
}

engine.start(update, draw);