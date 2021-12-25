export class Rect {

    x = 0;
    y = 0;

    x_v = 0;
    y_v = 0;

    rotation = 0;
    
    width = 1;
    height = 1;

    constructor(x, y, width, height) {
        this.type = 'rect';
        this.origin = [0, 0];
        this.x = x;
        this.y = y;
        this.x_v = 0;
        this.y_v = 0;
        this.rotation = 0;
        this.width = width;
        this.height = height;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getMidPoint_x() {
        return this.x + (this.width / 2);  
    }

    getMidPoint_y() {
        return this.y + (this.height / 2);  
    }
}