let ball = CREATE_CIRCLE({
	x: SCREEN_WIDTH / 2,
	y: SCREEN_HEIGHT - 50,
	radius: 15,
	speed: 0,
	ySpeed: 0,
	maxSpeed: 5,
	color: '#ffffff',
});

let center = SCREEN_WIDTH / 2;
let obstacles = [];
let timer = 0;
let delay = 15;
let obstacleSpeed = 5;

function UPDATE() {
	if (timer > 0) {
		timer--;
	} else {
		timer = delay;
		let obstacle = CREATE_CIRCLE({
			x: RANDOM_RANGE(0, SCREEN_WIDTH),
			y: -15,
			radius: 15,
			speed: 5,
			color: '#aaaaaa',
		});
		obstacles.push(obstacle);
	}

	let collides = null;
	let collider = 0;
	for(let i=0; i < obstacles.length; i++) {
		obstacles[i].y += ball.ySpeed;
		if (obstacles[i].y - obstacles[i].radius > SCREEN_HEIGHT) {
			REMOVE(obstacles[i]);
			obstacles.splice(i, 1);
		}
		if (DO_CIRCLES_COLLIDES(ball, obstacles[i])) {
			collides = obstacles[i];
		}
	}

	let canMoveLeft = true;
	let canMoveRight = true;

	if (collides != null) {
		ball.color = 'red';
		canMoveRight = collides.x < ball.x;	
		canMoveLeft = !canMoveRight;
        if (collides.y > ball.y)
		    ball.ySpeed = 0;
        if ((ball.speed > 0 && !canMoveRight) || (ball.speed < 0 && !canMoveLeft))
            ball.speed = -ball.speed * 0.5
	} else {
		ball.color = 'white';
		ball.ySpeed += 0.005;
		if (ball.ySpeed > 5)
			ball.ySpeed = 5;
	}

	if (canMoveRight && KEY_DOWN('ArrowRight')) {
		ball.speed += 0.25;
		if (ball.speed > ball.maxSpeed)
			ball.speed = ball.maxSpeed;
	}
	if (canMoveLeft && KEY_DOWN('ArrowLeft')) {
		ball.speed -= 0.25;
		if (ball.speed < -ball.maxSpeed)
			ball.speed = -ball.maxSpeed;
	}
	
	ball.x += ball.speed;

	if (ball.x > SCREEN_WIDTH - ball.radius || ball.x < 0 + ball.radius) {
		ball.speed = -ball.speed * 0.8;
		ball.x += ball.speed;	
	}
}