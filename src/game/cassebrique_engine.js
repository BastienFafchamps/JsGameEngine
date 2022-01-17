let ball = CREATE_CIRCLE({
    x: 20,
    y: 60,
    radius: 10,
    color: "#ffffff",
    dx: -2,
    dy: -2,
});

let paddle = CREATE_RECT({
    x: 10,
    y: SCREEN_HEIGHT - 25,
    height: 20,
    width: 100,
    color: "#ffffff",
    speed: 3,
});

let brickWidth = 50;
let brickHeight = 20;

let colors = [
    "#444444",
    "#aaaaaa",
    "#ffffff",
]

let bricks = [];
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        let brick = CREATE_RECT({
            x: ((brickWidth + 10) * i) + 50,
            y: ((brickHeight + 10) * j) + 50,
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

    if (ball.y < ball.radius || DO_RECT_CIRCLE_COLLIDES(paddle, ball) && ball.y > paddle.y)
        ball.dy = -ball.dy;
    else if (ball.y > SCREEN_HEIGHT + ball.radius)
        STOP();

    if (ball.x < ball.radius || ball.x + ball.radius > SCREEN_WIDTH)
        ball.dx = -ball.dx;

    if ((KEY_DOWN('Right') || KEY_DOWN('ArrowRight')) && paddle.x < SCREEN_WIDTH - paddle.width)
        paddle.x += paddle.speed;

    if ((KEY_DOWN('Left') || KEY_DOWN('ArrowLeft')) && paddle.x > 0)
        paddle.x -= paddle.speed;

    bricks = bricks.filter(brick => {
        if (DO_RECT_CIRCLE_COLLIDES(brick, ball)) {
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