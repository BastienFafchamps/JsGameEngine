SET_BACKGROUND('black');

let length = 40;
let amp = 3;
let speed = 0.1;

let i = 0;
function UPDATE() {
	i += speed;
}

function DRAW() {
	for (let x=0; x < length; x++) {
		let color = COLOR_HSL((x + i % length) / length * 360, 100, 50);
		DRAW_PIXEL(x, Math.sin(x + i) * amp + (SCREEN_HEIGHT / 2), color);
	}
}

// Small footprint wave
SET_BACKGROUND('black');

let i = 0;
function DRAW() {
	i += 0.1;	
	for (let x=0; x < 40; x++) {
		let color = COLOR_HSL((x + i % 40) / 40 * 360, 100, 50);
		DRAW_PIXEL(x, Math.sin(x + i) * 3 + (SCREEN_HEIGHT / 2), color);
	}
}


SET_BACKGROUND('black');
let pixels = [];

function UPDATE() {
	pixels = pixels.filter(px => {
		px.x -= 0.5;
		px.y += RANDOM() + 0.5;
		return px.x > 0;
	});
	pixels.push({x: MOUSE_POS.x, y: MOUSE_POS.y});
}

let i = 0;
function DRAW() {
	i += 0.1;	
	for (let x=0; x < pixels.length; x++) {
		let color = COLOR_HSL((x + i % 40) / 40 * 360, 100, 50);
		DRAW_PIXEL(pixels[x].x, Math.sin(x + i) * 3 + pixels[x].y, color);
	}
}