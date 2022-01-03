let ball = {
    x: 20,
    y: 60,
    radius: 10,
    dx: -2,
    dy: -2,
};

let paddle = {
    x: 10,
    y: SCREEN_HEIGHT - 25,
    height: 20,
    width: 100,
    speed: 3,
};

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
        let brick = {
            x: ((brickWidth + brickSpacing) * i) + bricks_x_start,
            y: ((brickHeight + brickSpacing) * j) + bricks_y_start,
            width: brickWidth,
            height: brickHeight,
            life: 3,
        };
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
        // alert("GAME OVER");
        // document.location.reload();
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
            return brick.life;
        }
        return true;
    });
}

function DRAW() {
    bricks.forEach(brick => {
        DRAW_RECT(
            brick.x, 
            brick.y, 
            brickWidth, 
            brickHeight, 
            colors[brick.life - 1]
        );
    });
    DRAW_CIRCLE(ball.x, ball.y, ball.radius, "#0095DD");
    DRAW_RECT(paddle.x, paddle.y, paddle.width, paddle.height, "#0095DD");
}