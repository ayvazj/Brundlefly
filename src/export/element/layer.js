function getLayerType(layer) {
    if (layer instanceof CameraLayer) {
        return "CAMERA";
    }
    else if (layer instanceof LightLayer) {
        return "LIGHT";
    }
    else if (layer instanceof ShapeLayer) {
        return "SHAPE";
    }
    else if (layer instanceof TextLayer) {
        return "TEXT";
    }
    else if (layer instanceof AVLayer) {
        return "AVLayer";
    }
    else if (layer.threeDLayer == true) {
        if (layer.nullLayer == true) {
            return "NULL";
        }
        else if (layer.nullLayer == false) {
            return "SOLID";
        }
    }
    else {
        return undefined;
    }
}

function getLayerScale(layer) {
    var layerTransform = getTransform(layer.property("ADBE Transform Group"));
    var scaleX = 1;
    if (layerTransform.scaleX && layerTransform.scaleX.length > 0) {
        scaleX = layerTransform.scaleX[0].v;
    }

    var scaleY = 1;
    if (layerTransform.scaleY && layerTransform.scaleY.length > 0) {
        scaleY = layerTransform.scaleY[0].v;
    }

    return {
        sx: scaleX,
        sy: scaleY
    };
}

function getLayerRotation(layer) {
    var layerTransform = getTransform(layer.property("ADBE Transform Group"));
    var rotation = 0;
    if (layerTransform.rotation && layerTransform.rotation.length > 0) {
        rotation = layerTransform.rotation[0].v;
    }
    return rotation;
}

function getLayerOpacity(layer) {
    var layerTransform = getTransform(layer.property("ADBE Transform Group"));
    var opacity = 1;
    if (layerTransform.opacity && layerTransform.opacity.length > 0) {
        opacity = layerTransform.opacity[0].v;
    }
    return opacity;
}

function getLayerPosition(layer, containerWidth, containerHeight) {
    var layerTransform = getTransform(layer.property("ADBE Transform Group"));
    var position = {x: 0, y: 0};
    if (layerTransform.position && layerTransform.position.length > 0) {
        position = {x: layerTransform.position[0].v[X], y: layerTransform.position[0].v[Y]};
    }

    return {
        x: rel(position.x, containerWidth),
        y: rel(position.y, containerHeight)
    };
}

