AE Brundlefly Exporter
======================

AE Brundlefly exporter is an ExtendScript that exports your AE project to JSON
so that it can be rendered using the Brundlefly library for iOS and Android.
It is inspired by and attempts to be compatible with the Butterfly file format
used in Google mobile products (i.e.Google Photos).

## Donations

Help me pay my Adobe bill so I can continue to work on this project.

<a href='https://pledgie.com/campaigns/31175'><img alt='Click here to lend your support to: Adobe After Effects and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/31175.png?skin_name=chrome' border='0' ></a>

## Limitations

Keep the following limitations in mind while creating your After Effects animation:

* Supported Layer Types:
	* Shape Layer - Rectangle
	* Shape Layer - Ellipse
	* Text Later
	* AVLayer for images only

* Only one shape per layer

* Only layer transformations are animated when exported

* Parents must appear below children in the layer stack

* Keep in mind your layers get exported as Views on iOS/Android.

## Download
### Export Script
[brundlefly-export.jsx](https://raw.githubusercontent.com/ayvazj/brundlefly/master/dist/brundlefly-export.jsx)

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
