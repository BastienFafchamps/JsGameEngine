const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

let ball = {
    radius: 10,
    x: canvas.width/2,
    y: canvas.height-30,
    dx: -1.5,
    dy: -1.5,
}

let paddle = {
    height: 20,
    width: 100,
    x: 10,
    speed: 4,
}

let rightPressed = false;
let leftPressed = false;

let brickWidth = 50;
let brickHeight = 30;
let brickPadding = 5;
let bricks = [];

let bricks_x_start = 3.25;
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bricks.forEach(brick => {
        drawBrick(brick.x, brick.y, brickWidth, brickHeight, brickPadding, colors[brick.life - 1]);
    });

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height - 5, paddle.width, paddle.height);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y < ball.radius || isBallOnPaddle())
        ball.dy = -ball.dy;
    else if(ball.y > canvas.height + ball.radius) {
        alert("GAME OVER");
        document.location.reload();
        clearInterval(interval); // Needed for Chrome to end game
    }

    // if (ball.y + ball.dy < ball.radius || ball.y + ball.dy + ball.radius > canvas.height)
    //     ball.dy = -ball.dy;
    if (ball.x < ball.radius || ball.x + ball.radius > canvas.width)
        ball.dx = -ball.dx;

    if (rightPressed && paddle.x < canvas.width - paddle.width)
        paddle.x += paddle.speed;

    if (leftPressed && paddle.x > 0)
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

function drawBrick(x, y, width, height, padding, color) {
    ctx.beginPath();
    ctx.rect(x + padding, y + padding, width - (2 * padding), height - (2 * padding));
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function isBallOnPaddle() {
    return ball.y + ball.radius > canvas.height - paddle.height - 5 && ball.x > paddle.x && ball.x < paddle.x + paddle.width;
}

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

var interval = setInterval(draw, 10);