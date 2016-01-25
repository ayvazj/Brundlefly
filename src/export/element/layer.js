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

function parsePositionProperty(layer) {
    var comp = layer.containingComp;
    var layerTransform = layer.property("ADBE Transform Group");
    var prop = layerTransform.property("ADBE Position");
    return parseMarkerProperty(comp, prop, "Position", "position", function (index, keyTime, keyValue) {
        if (index == 1) {
            return [
                keyTime,
                {"x": rel(keyValue[0], comp.width), "y": rel(keyValue[1], comp.height)}
            ];
        }
        else {
            return [
                keyTime,
                {"x": rel(keyValue[0], comp.width), "y": rel(keyValue[1], comp.height)},
                {
                    "name": "linear",
                    "x1": 1,
                    "y1": 1,
                    "x2": 1,
                    "y2": 1
                }
            ];
        }
    });
}

function parseMarkerProperty(comp, prop, id, propname, callback) {
    if (prop) {
        var duration = 0;
        var keyframes = [];
        for (var i = 0; i < prop.numKeys; i++) {
            var keyTime = prop.keyTime(i + 1);
            duration += keyTime;
        }

        for (var i = 0; i < prop.numKeys; i++) {
            var keyTime = prop.keyTime(i + 1) / duration;
            var keyValue = prop.keyValue(i + 1);

            var frame = callback(i, keyTime, keyValue);
            if (frame) {
                keyframes.push(frame);
            }
        }
        if (keyframes.length > 0) {
            return {
                "type": "animation",
                "id": id,
                "duration": duration,
                "delay": comp.delay ? comp.delay : 0,
                "property": propname,
                "keyframes": keyframes
            };
        }
    }
}

function parseScaleProperty(layer) {
    var comp = layer.containingComp;
    var layerTransform = layer.property("ADBE Transform Group");
    var prop = layerTransform.property("ADBE Scale");
    return parseMarkerProperty(comp, prop, "Scale", "scale", function (index, keyTime, keyValue) {
        if (index == 1) {
            return [
                keyTime,
                {"sx": (keyValue[0] / 100), "sy": (keyValue[1] / 100)}
            ];
        }
        else {
            return [
                keyTime,
                {"sx": (keyValue[0] / 100), "sy": (keyValue[1] / 100)},
                {
                    "name": "linear",
                    "x1": 1,
                    "y1": 1,
                    "x2": 1,
                    "y2": 1
                }
            ];
        }
    });
}

function parseRotationProperty(layer) {
    var comp = layer.containingComp;
    var layerTransform = layer.property("ADBE Transform Group");
    var prop = layerTransform.property("ADBE Rotate Z");
    return parseMarkerProperty(comp, prop, "Rotation", "rotation", function (index, keyTime, keyValue) {
        if (index == 1) {
            return [
                keyTime,
                keyValue
            ];
        }
        else {
            return [
                keyTime,
                keyValue,
                {
                    "name": "linear",
                    "x1": 1,
                    "y1": 1,
                    "x2": 1,
                    "y2": 1
                }
            ];
        }
    });
}

function parseOpacityProperty(layer) {
    var comp = layer.containingComp;
    var layerTransform = layer.property("ADBE Transform Group");
    var prop = layerTransform.property("ADBE Opacity");
    return parseMarkerProperty(comp, prop, "Opacity", "opacity", function (index, keyTime, keyValue) {
        if (index == 1) {
            return [
                keyTime,
                keyValue
            ];
        }
        else {
            return [
                keyTime,
                (keyValue / 100),
                {
                    "name": "linear",
                    "x1": 1,
                    "y1": 1,
                    "x2": 1,
                    "y2": 1
                }
            ];
        }
    });
}


function getLayerAnimations(layer) {
    var animations = [];

    var scaleAnim = parseScaleProperty(layer);
    if (scaleAnim) {
        animations.push(scaleAnim);
    }

    var posAnim = parsePositionProperty(layer);
    if (posAnim) {
        animations.push(posAnim);
    }

    var rotAnim = parseRotationProperty(layer);
    if (rotAnim) {
        animations.push(rotAnim);
    }

    var opacityAnim = parseOpacityProperty(layer);
    if (opacityAnim) {
        animations.push(opacityAnim);
    }

    return animations;
}