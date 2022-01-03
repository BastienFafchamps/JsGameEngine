let ball = CREATE_CIRCLE({
    x: 20,
    y: 60,
    radius: 10,
    color: "#0095DD",
    dx: -2,
    dy: -2,
});

let paddle = CREATE_RECT({
    x: 10,
    y: SCREEN_HEIGHT - 25,
    height: 20,
    width: 100,
    color: "#0095DD",
    speed: 3,
});

let brickWidth = 50;
let brickHeight = 20;
let brickSpacing = 10;
let bricks = [];

let bricks_x_start = 50;
let bricks_y_start = 50;

let colors = [
    "#ade4ff",
    "#48bef7",
    "#0095DD",
]

for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        let brick = CREATE_RECT({
            x: ((brickWidth + brickSpacing) * i) + bricks_x_start,
            y: ((brickHeight + brickSpacing) * j) + bricks_y_start,
            width: brickWidth,
            height: brickHeight,
            life: 3,
            color: colors[2],
        });
        bricks.push(brick);
    }
}

function UPDATE() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    function isBallOnPaddle() {
        return ball.y + ball.radius > SCREEN_HEIGHT - paddle.height - 5 && ball.x > paddle.x && ball.x < paddle.x + paddle.width;
    }

    if (ball.y < ball.radius || isBallOnPaddle())
        ball.dy = -ball.dy;
    else if(ball.y > SCREEN_HEIGHT + ball.radius) {
        STOP();
    }

    if (ball.x < ball.radius || ball.x + ball.radius > SCREEN_WIDTH)
        ball.dx = -ball.dx;

    if ((KEY_DOWN('Right') || KEY_DOWN('ArrowRight')) && paddle.x < SCREEN_WIDTH - paddle.width)
        paddle.x += paddle.speed;

    if ((KEY_DOWN('Left') || KEY_DOWN('ArrowLeft')) && paddle.x > 0)
        paddle.x -= paddle.speed;

    bricks = bricks.filter(brick => {
        if (ball.y > brick.y && ball.y < brick.y + brickHeight && ball.x > brick.x && ball.x < brick.x + brickWidth) {
            ball.dy = -ball.dy;
            brick.life -= 1;
            if (brick.life > 0) {
                brick.color = colors[brick.life - 1];
                return true;
            } else {
                REMOVE(brick);
                return false;
            }
        }
        return true;
    });
}