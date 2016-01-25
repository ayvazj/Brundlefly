function getAnimationGroup(config, layer, animations) {

    var group = {};

    //if (layer.inPoint) group.in = Math.round(layer.inPoint * 1000);
    //if (layer.outPoint) group.out = Math.round(layer.outPoint * 1000);

    if (typeof group.in !== 'undefined' && group.in < 0) group.in = 0;

    group.id = normalizeToId(layer.name);
    group.type = "animationGroup";
    group.duration = (Math.round(layer.outPoint * 1000) - Math.round(layer.inPoint * 1000)) / 1000;

    if (layer.parent) {
        group.parentId = normalizeToId(layer.parent.name);
    }

    group.initialValues = {};
    group.animations = [];

    var layerTransform = getTransform(layer.property("ADBE Transform Group"));
    var layerType = getLayerType(layer);

    switch (layerType) {
        case "SHAPE":
            getShapeLayer(group, layer);
            break;
        case "AVLayer":
            getAVLayer(config.destdir, group, layer);
            break;
        case "TEXT":
            getTextLayer(group, layer);
            break;
        default:
            break;
    }

    return group;

    function getShapeLayer(group, layer) {
        var layerTransform = getTransform(layer.property("ADBE Transform Group"));
        var contents = getShape(layer, []);
        if (contents && contents.length > 0) {
            for (var i = 0; i < contents.length; i++) {
                var content = contents[i];

                // transform shape into final position and size
                content.transforms.pop();
                var shapeMatrix = mergeTransforms(content.transforms);

                group.shape = {};
                if (content.type === "ellipse") {
                    group.shape.name = "ellipse";
                }
                else if (content.type === "rect") {
                    group.shape.name = "rectangle";
                    for (var v = 0; v < content.vertices.length; v++) {
                        var targetVec = vec2.create();
                        vec2.transformMat3(targetVec, vec2.fromValues(content.vertices[v].x, content.vertices[v].y), shapeMatrix);

                        content.vertices[v].x = targetVec[0];
                        content.vertices[v].y = targetVec[1];
                    }
                }

                var width = content.getWidth();
                var height = content.getHeight();
                var center = content.getCenter();


                group.initialValues = {};
                group.initialValues.center = center;
                group.initialValues.size = {
                    width: rel(width, layer.width),
                    height: rel(height, layer.height)
                };

                // TODO calculate anchorPoint
                group.initialValues.anchorPoint = {x: 0.5, y: 0.5};
                group.initialValues.scale = getLayerScale(layer);
                group.initialValues.rotation = getLayerRotation(layer);
                group.initialValues.opacity = getLayerOpacity(layer);

                var anchorPos = {x: 0, y: 0};
                if (layerTransform.anchor && layerTransform.anchor.length > 0) {
                    anchorPos = {x: layerTransform.anchor[0].v[X], y: layerTransform.anchor[0].v[Y]};
                }

                var position = {x: 0, y: 0};
                if (layerTransform.position && layerTransform.position.length > 0) {
                    position = {x: layerTransform.position[0].v[X], y: layerTransform.position[0].v[Y]};
                }
                position.x = (position.x - anchorPos.x) + center.x;
                position.y = (position.y - anchorPos.y) + center.y;

                group.initialValues.position = {
                    x: rel(position.x, layer.width),
                    y: rel(position.y, layer.height)
                };

                //group.initialValues.rawposition = {
                //    x: (position.x + center.x),
                //    y: (position.y + center.y),
                //    posx: (position.x),
                //    posy: (position.y),
                //    centerx: (center.x),
                //    centery: (center.y)
                //};

                if (content.fill) {
                    group.initialValues.backgroundColor = content.fill.color[0].rgb;
                }
            }
        }

        group.animations = getLayerAnimations(layer);
        // uncomment to remove props from output file (useful for debugging)
        // group.contents = contents;
    }

    function getParentData(layer) {

        if (!layer) {
            return {
                width: 0,
                height: 0,
                center: {
                    x: 0,
                    y: 0
                },
                position: {
                    x: 0,
                    y: 0
                },
                anchor: {
                    x: 0,
                    y: 0
                }
            };
        }


        var layerTransform = getTransform(layer.property("ADBE Transform Group"));
        var layerType = getLayerType(layer);

        switch (layerType) {
            case "SHAPE":
                var contents = getShape(layer, []);
                if (contents && contents.length > 0) {
                    for (var i = 0; i < contents.length; i++) {
                        var content = contents[i];

                        // transform shape into final position and size
                        content.transforms.pop();
                        var shapeMatrix = mergeTransforms(content.transforms);

                        for (var v = 0; v < content.vertices.length; v++) {
                            var targetVec = vec2.create();
                            vec2.transformMat3(targetVec, vec2.fromValues(content.vertices[v].x, content.vertices[v].y), shapeMatrix);

                            content.vertices[v].x = targetVec[0];
                            content.vertices[v].y = targetVec[1];
                        }

                        var center = content.getCenter();

                        var anchorPos = {x: 0, y: 0};
                        if (layerTransform.anchor && layerTransform.anchor.length > 0) {
                            anchorPos = {x: layerTransform.anchor[0].v[X], y: layerTransform.anchor[0].v[Y]};
                        }

                        var position = {x: 0, y: 0};
                        if (layerTransform.position && layerTransform.position.length > 0) {
                            position = {x: layerTransform.position[0].v[X], y: layerTransform.position[0].v[Y]};
                        }
                        //position.x = (position.x - anchorPos.x) + center.x;
                        //position.y = (position.y - anchorPos.y) + center.y;

                        var parent = {};
                        if (content.type === "ellipse") {
                            parent.name = "ellipse";
                        }
                        else if (content.type === "rect") {
                            parent.name = "rectangle";
                        }

                        parent.width = content.getWidth();
                        parent.height = content.getHeight();
                        parent.center = center;
                        parent.position = position;
                        parent.anchor = anchorPos;

                        return parent;
                    }
                }

                break;
            case "AVLayer":
                var parent = {};
                var source = layer.source;

                var anchorPos = {x: 0, y: 0};
                if (layerTransform.anchor && layerTransform.anchor.length > 0) {
                    anchorPos = {x: layerTransform.anchor[0].v[X], y: layerTransform.anchor[0].v[Y]};
                }

                var position = {x: 0, y: 0};
                if (layerTransform.position && layerTransform.position.length > 0) {
                    position = {x: layerTransform.position[0].v[X], y: layerTransform.position[0].v[Y]};
                }

                var center = {
                    x: position.x + (source.width / 2),
                    y: position.y + (source.height / 2)
                };

                parent.width = source.width;
                parent.height = source.height;
                parent.center = center;
                parent.position = position;
                parent.anchor = anchorPos;

                return parent;
                break;
            case "TEXT":
                var parent = {};
                parent.width = content.getWidth();
                parent.height = content.getHeight();
                parent.center = center;
                parent.position = position;
                parent.anchor = anchorPos;

                return parent;

                break;
            default:
                break;

        }
    }

    function getAnchor(layerTransform, containerWidth, containerHeight) {
        var anchor = {x: (containerWidth / 2), y: (containerHeight / 2)};
        if (layerTransform.anchor && layerTransform.anchor.length > 0) {
            anchor = {x: layerTransform.anchor[0].v[X], y: layerTransform.anchor[0].v[Y]};
        }

        return {
            x: rel(anchor.x, containerWidth),
            y: rel(anchor.y, containerHeight)
        };
    }

    function getShape(data, transforms) {
        var shapes = [];
        var shape = undefined;
        var fill = undefined;
        for (var i = 1; i <= data.numProperties; i++) {
            var prop = data.property(i);

            var matchName = prop.matchName;
            console.log("matchName => " + matchName);

            if (prop.enabled) {
                switch (matchName) {
                    case 'ADBE Vector Blend Mode':
                        break;
                    case 'ADBE Transform Group':
                    case 'ADBE Vector Transform Group':
                        // don't add layer transform
                        //if (!data instanceof ShapeLayer) {
                        transforms.push(getTransform(prop));
                        //}
                        break;
                    case 'ADBE Vector Materials Group':
                        break;
                    case 'ADBE Root Vectors Group':
                    case 'ADBE Vectors Group':
                        for (var j = 1; j <= prop.numProperties; j++) {
                            var innerProp = prop.property(j);
                            var innerMatchName = innerProp.matchName;

                            if (innerProp.enabled) {
                                switch (innerMatchName) {
                                    case 'ADBE Vector Group':
                                        var subshapes = getShape(innerProp, transforms);
                                        for (var s = 0; s < subshapes.length; s++) {
                                            shapes.push(subshapes[s]);
                                        }
                                        break;
                                    case 'ADBE Vector Shape - Rect':
                                        shape = getRect(innerProp);
                                        break;
                                    case 'ADBE Vector Shape - Ellipse':
                                        shape = getEllipse(innerProp);
                                        break;
                                    case 'ADBE Vector Graphic - Fill':
                                        fill = getFill(innerProp);
                                }
                            }
                        }
                        break;
                }
            }
        }
        if (shape) {
            shape.transforms = transforms;
            if (fill) {
                shape.fill = fill;
            }
            shapes.push(shape);
            // TODO need to transforms.pop?
        }

        return shapes;
    }


    function getAVLayer(destdir, group, layer) {
        var comp = layer.containingComp;
        var source = layer.source;
        var layerTransform = getTransform(layer.property("ADBE Transform Group"));

        var sourceWidth = rel(source.width, comp.width);
        var sourceHeight = rel(source.height, comp.height);

        group.initialValues = {};
        group.initialValues.size = {
            width: rel(source.width, comp.width),
            height: rel(source.height, comp.height)
        };


        //var anchor = {x: 0.5, y: 0.5};
        //if (layerTransform.anchor && layerTransform.anchor.length > 0) {
        //    anchor = {x: layerTransform.anchor[0].v[X], y: layerTransform.anchor[0].v[Y]};
        //}

        group.initialValues.anchorPoint = {
            x: 0.5, // rel(anchor.x, comp.width),
            y: 0.5  // rel(anchor.y, comp.height)
        };

        group.initialValues.scale = getLayerScale(layer);
        group.initialValues.rotation = getLayerRotation(layer);
        group.initialValues.opacity = getLayerOpacity(layer);

        // AVLayer anchored at their top left corner, so make an adjustment
        var anchorPos = {x: 0, y: 0};
        if (layerTransform.anchor && layerTransform.anchor.length > 0) {
            anchorPos = {x: layerTransform.anchor[0].v[X], y: layerTransform.anchor[0].v[Y]};
        }


        var position = {x: 0, y: 0};
        if (layerTransform.position && layerTransform.position.length > 0) {
            position = {x: layerTransform.position[0].v[X], y: layerTransform.position[0].v[Y]};
        }

        var parentData = getParentData(layer.parent);

        position.x += parentData.width / 2;
        position.y += parentData.height / 2;

        group.initialValues.position = {
            x: rel(position.x, comp.width),
            y: rel(position.y, comp.height)
        };

        group.backgroundImage = "Images/" + source.file.name;
        var destFile = new File(config.destdir + "/Images/" + source.file.name);
        fs.copyFile(source.file, destFile);

        group.animations = getLayerAnimations(layer);
    }

    function getTextLayer(group, layer) {
        var comp = layer.containingComp;
        var layerTransform = getTransform(layer.property("ADBE Transform Group"));

        var textProperties = layer.property("ADBE Text Properties");
        var textDocument = textProperties.property("ADBE Text Document");
        console.printprops(textDocument);
        var textPath = textProperties.property("ADBE Text Path Options");
        var textMore = textProperties.property("ADBE Text More Options");
        var textAnimators = textProperties.property("ADBE Text Animators");

        if (!textDocument) {
            return undefined;
        }

        var center = {"x": 0.0, "y": 0.0};

        group.text = textDocument.value.text;
        group.initialValues = {};

        //var anchor = {x: 0.5, y: 0.5};
        //if (layerTransform.anchor && layerTransform.anchor.length > 0) {
        //    anchor = {x: layerTransform.anchor[0].v[X], y: layerTransform.anchor[0].v[Y]};
        //}

        group.initialValues.anchorPoint = {
            x: 0.0, // rel(anchor.x, comp.width),
            y: 0.0  // rel(anchor.y, comp.height)
        };

        group.initialValues.scale = getLayerScale(layer);
        group.initialValues.rotation = getLayerRotation(layer);
        group.initialValues.opacity = getLayerOpacity(layer);

        // AVLayer anchored at their top left corner, so make an adjustment
        var anchorPos = {x: 0, y: 0};
        //if (layerTransform.anchor && layerTransform.anchor.length > 0) {
        //    anchorPos = {x: layerTransform.anchor[0].v[X], y: layerTransform.anchor[0].v[Y]};
        //}


        var position = {x: 0, y: 0};
        if (layerTransform.position && layerTransform.position.length > 0) {
            position = {x: layerTransform.position[0].v[X], y: layerTransform.position[0].v[Y]};
        }

        var parentData = getParentData(layer.parent);

        position.x += parentData.width / 2;
        position.y += parentData.height / 2;

        group.initialValues.position = {
            x: rel(position.x, comp.width),
            y: rel(position.y, comp.height)
        };

        var step = 1.0; // higher values speed things up (2 means two times faster) but reduce precision

        group.initialValues.size = {
            "width": rel(group.text.length * textDocument.value.fontSize * textDocument.value.horizontalScale, comp.width),
            "height": rel(textDocument.value.fontSize * textDocument.value.verticalScale, comp.height)
        };

        if (textDocument.value.justify === ParagraphJustification.CENTER_JUSTIFY) {
            group.initialValues.textAlign = "center";
        }
        else if (textDocument.value.justify === ParagraphJustification.RIGHT_JUSTIFY) {
            group.initialValues.textAlign = "right";
        }
        else if (textDocument.value.justify === ParagraphJustification.CENTER_JUSTIFY) {
            group.initialValues.textAlign = "right-center";
        }
        else if (textDocument.value.justify === ParagraphJustification.CENTER_JUSTIFY) {
            group.initialValues.textAlign = "left-center";
        }
        else {
            group.initialValues.textAlign = "left";
        }


        group.initialValues.textColor = {
            "r": textDocument.value.fillColor[0],
            "g": textDocument.value.fillColor[1],
            "b": textDocument.value.fillColor[2],
            "a": 1
        };
        group.initialValues.fontSize = rel(textDocument.value.fontSize, comp.width);

        group.animations = getLayerAnimations(layer);
    }






}