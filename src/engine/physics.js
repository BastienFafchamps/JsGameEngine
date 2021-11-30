
export default class Physics {
    constructor() {
    }

    doCollides(rect_a, rect_b) {
        // rect_a.x + width
        // return (rect_a.x > rect_b.x && rect_a.x < rect_b.x + rect_b.width) ||
        //     (rect_a.x + width > rect_b.x && rect_a.x + width < rect_b.x + rect_b.width)
            
        //     rect_a.y > rect_b.y &&
        //     rect_a.y < rect_b.y + rect_y.width;
    }
}

export class Rect {

    x = 0;
    y = 0;
    width = 1;
    height = 1;

    constructor(x, y, width, height) {
        this.type = 'rect';
        this.origin = [0, 0];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Cirlcle {

    x = 0;
    y = 0;
    radius = 1;

    constructor(x, y, radius) {
        this.type = 'circle';
        this.origin = [0, 0];
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}