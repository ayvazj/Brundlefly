function getTransform(data) {
    var transform = {};

    getAnchor(data, transform);
    getPosition(data, transform);
    getScale(data, transform);
    getRotation(data, transform);
    getOpacity(data, transform);

    return transform;
}

function mulScale(transform, inmatrix) {
    var matrix = mat3.create();
    var scaleX = 1;
    var scaleY = 1;

    if (transform.scaleX && transform.scaleX.length > 0) {
        scaleX = transform.scaleX[0].v;
    }
    if (transform.scaleY && transform.scaleY.length > 0) {
        scaleY = transform.scaleY[0].v;
    }

    if (scaleX != 1 || scaleY != 1) {
        mat3.scale(
            matrix,
            inmatrix,
            vec2.fromValues(scaleX, scaleY)
        );
        return matrix;
    }
    else {
        return inmatrix;
    }
}

function transform2mat3(transform) {
    var matrix = mat3.create();

    var position = {x: 0, y: 0};
    if (transform.position && transform.position.length > 0) {
        position = {x: transform.position[0].v[X], y: transform.position[0].v[Y]};
    }

    if (position.x != 0 || position.y != 0) {
        mat3.translate(
            matrix,
            mat3.clone(matrix),
            vec2.fromValues(position.x, position.y)
        );
    }

    var anchor = {x: 0, y: 0};
    if (transform.anchor && transform.anchor.length > 0) {
        anchor = {x: transform.anchor[0].v[X], y: transform.anchor[0].v[Y]};
    }
    if (anchor.x != 0 || anchor.y != 0) {
        mat3.translate(
            matrix,
            mat3.clone(matrix),
            vec2.fromValues(anchor.x * -1, anchor.y * -1)
        );
    }

    matrix = mulScale(transform, mat3.clone(matrix));

    return matrix;
}

function mergeTransforms(transforms) {
    var merged = mat3.create();
    if (transforms) {
        var finalMatrix = mat3.create();
        for (var t = 0; t < transforms.length; t++) {
            mat3.multiply(merged, mat3.clone(merged), transform2mat3(transforms[t]));
        }
    }
    return merged;
}

