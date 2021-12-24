
class CollisionDetector {

    static doSimpleRectIntersect(rect1, rect2) {
        return (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y);
    }

    static doSimpleCirlceIntersect(circle1, circle2) {
        let dx = circle1.x - circle2.x;
        let dy = circle1.y - circle2.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return (distance < circle1.radius + circle2.radius);
    }

    /**
     * Helper function to determine whether there is an intersection between the two polygons described
     * by the lists of vertices. Uses the Separating Axis Theorem
     *
     * @param rect1Points an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
     * @param rect2Points an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
     * @return true if there is any intersection between the 2 polygons, false otherwise
     */
    static doRotatedPolygonsIntersect(rect1Points, rect2Points) {
        let polygons = [rect1Points, rect2Points];
        let minA, maxA, projected, i, i1, j, minB, maxB;

        for (i = 0; i < polygons.length; i++) {
            // for each polygon, look at each edge of the polygon, and determine if it separates
            // the two shapes
            let polygon = polygons[i];
            for (i1 = 0; i1 < polygon.length; i1++) {

                // grab 2 vertices to create an edge
                let i2 = (i1 + 1) % polygon.length;
                let p1 = polygon[i1];
                let p2 = polygon[i2];

                // find the line perpendicular to this edge
                let normal = { x: p2.y - p1.y, y: p1.x - p2.x };

                minA = maxA = undefined;
                // for each vertex in the first shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                for (j = 0; j < rect1Points.length; j++) {
                    projected = normal.x * rect1Points[j].x + normal.y * rect1Points[j].y;
                    if (minA == null || projected < minA) {
                        minA = projected;
                    }
                    if (maxA == null || projected > maxA) {
                        maxA = projected;
                    }
                }

                // for each vertex in the second shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                minB = maxB = undefined;
                for (j = 0; j < rect2Points.length; j++) {
                    projected = normal.x * rect2Points[j].x + normal.y * rect2Points[j].y;
                    if (minB == null || projected < minB) {
                        minB = projected;
                    }
                    if (maxB == null || projected > maxB) {
                        maxB = projected;
                    }
                }

                // if there is no overlap between the projects, the edge we are looking at separates the two
                // polygons, and we know there is no overlap
                if (maxA < minB || maxB < minA) {
                    return false;
                }
            }
        }
        return true;
    }
}