import CMath from './math';

export default class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector2) {
        this.x += vector2.x;
        this.y += vector2.y;
    }

    divide(a) {
        this.x = this.x / a;
        this.y = this.y / a;
    }

    normalized() {
        let magnitude = this.magnitude();
        if (magnitude > 0) {
            return Vector2(this.x / magnitude, this.y / magnitude);
        } else {
            return Vector2(0, 0);
        }
    }

    magnitude() {
        return CMath.sqrt((this.x * this.x) + (this.y * this.y));
    }
}