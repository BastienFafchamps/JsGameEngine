let ball = {
    radius: 10,
    x: 20,
    y: 60,
    dx: -2,
    dy: -2,
}

let paddle = {
    height: 20,
    width: 100,
    x: 10,
    speed: 3,
}

let brickWidth = 50;
let brickHeight = 20;
let brickSpacing = 10;
let bricks = [];

let bricks_x_start = 50;
let bricks_y_start = 50;

for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        bricks.push({
            x: ((brickWidth + brickSpacing) * i) + bricks_x_start, 
            y: ((brickHeight + brickSpacing) * j) + bricks_y_start, 
            life: 3
        });
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

    function isBallOnPaddle() {
        return ball.y + ball.radius > canvas.height - paddle.height - 5 && ball.x > paddle.x && ball.x < paddle.x + paddle.width;
    }

    if (ball.y < ball.radius || isBallOnPaddle())
        ball.dy = -ball.dy;
    else if(ball.y > canvas.height + ball.radius) {
        // alert("GAME OVER");
        // document.location.reload();
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
        engine.drawRect(
            brick.x, 
            brick.y, 
            brickWidth, 
            brickHeight, 
            colors[brick.life - 1]
        );
    });

    engine.drawEclipse(ball.x, ball.y, ball.radius, "#0095DD");
    engine.drawRect(paddle.x, canvas.height - paddle.height - 5, paddle.width, paddle.height, "#0095DD");
}

engine.start(update, draw);