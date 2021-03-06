﻿function getComp(config, comp) {

    var data = {};
    data.version = config.versionCode;
    data.comment = ""
        + timestampString() + " '"
        + config.file.name + "' exported by "
        + config.name + " v"
        + config.versionString;


    data.type = "stage";
    data.aspectRatio = (comp.width / comp.height);
    data.size = {
        "width": comp.width,
        "height": comp.height
    };
    data.animations = [];

    // reverse order so z order of layers is preserved
    for (var i = comp.numLayers; i > 0; i--) {
        var layer = comp.layer(i);

        if (!layer.enabled) {
            continue;
        }

        if (layer instanceof ShapeLayer || layer instanceof AVLayer || layer instanceof TextLayer) {
            data.animations.push(getAnimationGroup(config, layer, data.animations));
        }
    }

    return data;
}