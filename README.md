AE Brundlefly Exporter
======================

AE Brundlefly exporter is an ExtendScript that exports your AE project to JSON
so that it can be rendered using the Brundlefly library for iOS and Android.
It is inspired by and attempts to be compatible with the Butterfly file format
used in Google mobile products (i.e.Google Photos).

The following layer types/objects are supported:

* Rectangle
* Ellipse
* Text
* AVLayer for images
* Animated transforms (layer only)

## Download
### Export Script
[brundlefly-export.jsx](https://raw.githubusercontent.com/ayvazj/brundlefly/master/build/brundlefly-export.jsx)

## Usage
In After Effects, open and select the composition you want to export and
run the file `brundlefly-export.jsx` from the menu: `File -> Scripts -> Run Script File...`.

Save the the file as JSON.
**AVLayer assets will be copied to a *Images* subdirectory.**

Copy the JSON file and the *Images* subdirectory into your mobile apps
bundle *iOS* or assets directory *Android*.

See the respective [**iOS**](https://github.com/ayvazj/BrundleflyiOS) and [**Android**](https://github.com/ayvazj/BrundleflyAndroid) projects for instructions on how to render
the exported JSON file.

** This code started life as a modification of [ae2canvas](https://github.com/KiloKilo/ae2canvas) but has since diverged.