SET_BACKGROUND('black');

let pixels = [];
let particles = [];
let blocks = [];
let lives = 3;

function spawnParticles(x, y) {
	for (let i=0; i < 10; i++) {
		particles.push({
			x: x,
			y: y,
			dx: RANDOM_RANGE(-1, 0),
			dy: RANDOM_RANGE(-1, 1),
		});
	}
}

let timer = 0;
function UPDATE() {
	timer++;
	if (timer > 20) {
		timer = 0;

		blocks.push({
			speed: 0.5,
			x: SCREEN_WIDTH,
			y: Math.round(RANDOM_RANGE(0, SCREEN_HEIGHT)),
			size: 3,
		});
	}

	blocks = blocks.filter(b => {
		b.x -= b.speed;

		if (IS_MOUSE_OVER(b)) {
			lives--;
			spawnParticles(b.x, b.y);
			return false;
		}

		return b.x > 0;
	});

	particles = particles.filter(p => {
		p.x += p.dx;
		p.y += p.dy;
		p.dy += 0.05;
		return p.x >= 0 && p.y <= SCREEN_HEIGHT;
	});

	pixels = pixels.filter(px => {
		px.x -= 0.5;
		px.y += px.d;
		return px.x >= 0;
	});
	pixels.push({x: MOUSE_POS.x, y: MOUSE_POS.y, d: RANDOM_RANGE(-0.1, 0.1)});
}

let i = 0;
function DRAW() {
	blocks.forEach(b => {
		DRAW_RECT(b.x, b.y, b.size, b.size, "red");
	})

	particles.forEach(p => {
		DRAW_PIXEL(p.x, p.y, 'red');
	})

	TEXT(`${lives}`, 0, 0, 15, 'white');

	i += 0.1 % 60;
	for (let j=0; j < pixels.length; j++) {
		let color = COLOR_HSL((j + i % 40) / 40 * 360, 100, 50);
		DRAW_PIXEL(pixels[j].x, pixels[j].y, color);
	}
}
