function getRect(data) {

    var rect = {};
    var x = 0, y = 1;

    rect.name = data.name;
    rect.type = 'rect';

    rect.size = getProperty(data.property('ADBE Vector Rect Size'));
    rect.size = roundValue(rect.size);
    rect.size = normalizeKeyframes(rect.size);

    //optional
    var offsetX = 0;
    var offsetY = 0;
    var position = data.property('ADBE Vector Rect Position');
    if (position.isTimeVarying || position.value[0] !== 0 || position.value[1] !== 0) {
        position = getProperty(position);
        position = normalizeKeyframes(position);
        rect.position = position;
        offsetX = position[0].v[x];
        offsetY = position[0].v[y];
    }

    var roundness = data.property('ADBE Vector Rect Roundness');
    if (roundness.isTimeVarying || roundness.value !== 0) {
        roundness = getProperty(roundness);
        roundness = normalizeKeyframes(roundness);
        rect.roundness = roundness;
    }

    // calculate the vertices based on the size of the rect
    rect.vertices = [];
    for (var i = 0; i < rect.size.length; i++) {
        rect.vertices.push(
            {
                x: (rect.size[i].v[x] * 0.5) + offsetX, y: (rect.size[i].v[y] * 0.5) + offsetY
            },
            {
                x: (rect.size[i].v[x] * 0.5) + offsetX, y: (rect.size[i].v[y] * -0.5) + offsetY
            },
            {
                x: (rect.size[i].v[x] * -0.5) + offsetX, y: (rect.size[i].v[y] * -0.5) + offsetY
            },
            {
                x: (rect.size[i].v[x] * -0.5) + offsetX, y: (rect.size[i].v[y] * 0.5) + offsetY
            });
    }

    rect.getWidth = function () {
        return this.vertices[0].x - this.vertices[2].x;
    };

    rect.getHeight = function () {
        return this.vertices[0].y - this.vertices[1].y;
    };

    rect.getCenter = function () {
        return {
            x: this.vertices[2].x + (this.getWidth() / 2),
            y: this.vertices[1].y + (this.getHeight() / 2)
        };
    };


    return rect;
}


