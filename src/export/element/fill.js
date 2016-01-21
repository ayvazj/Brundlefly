function getFill(data) {
    var fill = {};

    fill.index = data.propertyIndex;
    //fill.composite = data.property('ADBE Vector Composite Order');

    fill.color = getProperty(data.property('ADBE Vector Fill Color'));
    fill.color = multiplyValue(fill.color, 255);
    fill.color = normalizeKeyframes(fill.color);
    fill.color[0].rgb = {
        "r": fill.color[0].v[0] / 255.0,
        "g": fill.color[0].v[1] / 255.0,
        "b": fill.color[0].v[2] / 255.0,
        "a": fill.color[0].v[3] / 255.0
    };

    //optional
    var opacity = data.property('ADBE Vector Fill Opacity');

    if (opacity.isTimeVarying || opacity.value !== 100) {
        opacity = getProperty(opacity);
        opacity = normalizeKeyframes(opacity);
        opacity = divideValue(opacity, 100);
        fill.opacity = opacity;
    }

    return fill;
}

