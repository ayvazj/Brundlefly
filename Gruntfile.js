module.exports = function (grunt) {
    grunt.initConfig({
        pkg             : grunt.file.readJSON('package.json'),
        concat          : {
            dist: {
                src : [
                    'src/export/utils/json2.js',
                    'src/export/utils/utils.js',
                    'src/export/utils/keyframes.js',
                    'src/export/utils/motionpath.js',

                    'src/export/transform/transform.js',
                    'src/export/transform/anchor.js',
                    'src/export/transform/scale.js',
                    'src/export/transform/position.js',
                    'src/export/transform/rotation.js',
                    'src/export/transform/opacity.js',
                    'src/export/transform/skew.js',
                    'src/export/transform/skewAxis.js',

                    'src/export/element/comp.js',
                    'src/export/element/group.js',
                    'src/export/element/path.js',
                    'src/export/element/rect.js',
                    'src/export/element/ellipse.js',
                    'src/export/element/polystar.js',

                    'src/export/element/fill.js',
                    'src/export/element/stroke.js',

                    'src/export/element/merge.js',
                    'src/export/element/vectorTrim.js',

                    'src/export/property/property.js',
                    'src/export/property/staticProperty.js',
                    'src/export/property/animatedProperty.js',

                    'src/export/main.jsx'
                ],
                dest: 'dist/brundlefly-export.jsx'
            }
        },
        'string-replace': {
            dist: {
                files  : {
                    'dist/brundlefly-export.jsx': 'dist/brundlefly-export.jsx'
                },
                options: {
                    replacements: [{
                        pattern    : /#include.*/g,
                        replacement: ''
                    }]
                }
            }
        }
    });

    //
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.registerTask('build', ['concat', 'string-replace']);
};