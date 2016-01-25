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
                    'src/export/utils/logger.js',
                    'src/export/utils/gl-matrix.js',
                    'src/export/utils/filesystem.js',

                    'src/export/transform/transform.js',
                    'src/export/transform/anchor.js',
                    'src/export/transform/scale.js',
                    'src/export/transform/position.js',
                    'src/export/transform/rotation.js',
                    'src/export/transform/opacity.js',


                    'src/export/element/comp.js',
                    'src/export/element/layer.js',
                    'src/export/element/animationGroup.js',
                    'src/export/element/rect.js',
                    'src/export/element/ellipse.js',

                    'src/export/element/fill.js',

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