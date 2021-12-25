export default class CMath {    
    static sin(x) {
        return Math.sin(x);
    }

    static cos(x) {
        return Math.cos(x);
    }

    static pow(x, a) {
        return Math.pow(x, a);
    }

    static sqrt(x) {
        return Math.sqrt(x);
    }

    static dotProduct(vector2_a, vector2_b) {
        return (vector2_a.x * vector2_b.x) + (vector2_a.y * vector2_b.y);
    }

    static crossProduct(vector2_a, vector2_b) {
        return (vector2_a.x * vector2_b.y) - (vector2_a.y * vector2_b.x);
    }
}