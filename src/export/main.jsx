#include 'utils/json2.js'
#include 'utils/utils.js'
#include 'utils/keyframes.js'
#include 'utils/motionpath.js'
#include 'utils/logger.js'
#include 'utils/gl-matrix.js'
#include 'utils/filesystem.js'

#include 'transform/transform.js'
#include 'transform/anchor.js'
#include 'transform/scale.js'
#include 'transform/position.js'
#include 'transform/rotation.js'
#include 'transform/opacity.js'

#include 'element/comp.js'
#include 'element/layer.js'
#include 'element/animationGroup.js'
#include 'element/rect.js'
#include 'element/ellipse.js'

#include 'element/fill.js'

#include 'property/property.js'
#include 'property/staticProperty.js'
#include 'property/animatedProperty.js'

var fs = new FileSystem();
    
function main() {

    clearConsole();

    var btfyConfig = {
        versionCode: 1,
        versionString: "0.01",
        name: "Brundlefly Exporter",
        file: app.project.file
    };



    var data = getComp(btfyConfig, app.project.activeItem);
    var json = JSON.stringify(data, null, "  ");

    var outFile = File.saveDialog('Save the json file');
    if (outFile != null) {
        outFile.open("w", "TEXT", "????");
        outFile.write(json);
        outFile.close();
    }

    btfyConfig.destdir = outFile.path;

    //btfyConfig.destdir = '~/Src/github.com/ae2canvas';
    //var outFile = new File('~/Src/github.com/ae2canvas/out.json');
    //if (outFile != null) {
    //    outFile.open("w", "TEXT", "????");
    //    outFile.write(json);
    //    outFile.close();
    //}
    //
    //outFile = new File('~/Src/github.com/Brundlefly/Example/btfy/sample.btfy');
    //if (outFile != null) {
    //    outFile.open("w", "TEXT", "????");
    //    outFile.write(json);
    //    outFile.close();
    //}
    //
    //outFile = new File('~/Src/github.com/BrundleflyAndroid/app/src/main/assets/sample.btfy');
    //if (outFile != null) {
    //    outFile.open("w", "TEXT", "????");
    //    outFile.write(json);
    //    outFile.close();
    //}

    alert("Composition exported:\n" + outFile.path + "/" + outFile.name);
}
main();