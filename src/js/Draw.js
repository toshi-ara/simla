//////////////////////////////////
// function for drawing
//////////////////////////////////

class Draw {
    // Draw circle
    static drawCircle(context, center, radiusOuter, radiusInner, color) {
        // outer
        context.beginPath();
        context.arc(center[0], center[1], radiusOuter, 0, Math.PI * 2, true);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        context.beginPath();
        context.arc(center[0], center[1], radiusInner, 0, Math.PI * 2, false);
        context.fillStyle = color;
        context.fill();
        context.closePath();
    };

    // Fill region in canvas
    static fillRect(context, center, radius) {
        const r = radius * 1.3;
        context.fillStyle = "#f4d7d7";
        context.fillRect(center[0] - r, center[1] - r, r * 2, r * 2)
    };
}
