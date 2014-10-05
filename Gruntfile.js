module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        srcFiles: [
            'src/*.ts',
        ],
        ts: {
            debug: {
                src: ['src/*.ts'],
                out: 'build/invoker.js',
                options: {
                    target: 'es5',
                    declaration: true,
                    removeComments: false,
                },
            },
        },
        uglify: {
            ship: {
                files: {
                    'build/invoker.min.js': ['<%= ts.debug.out %>'],
                },
            },
        },
        jasmine: {
            debug: {
                src: '<%= ts.debug.out %>',
                options: {
                    specs: 'test/*.spec.js',
                },
            },
            ship: {
                src: 'build/invoker.min.js',
                options: {
                    specs: 'test/*.spec.js',
                },
            }
        },
        watch: {
            ts: {
                files: ['<%= ts.debug.src %>'],
                tasks: ['uglify:ship', 'jasmine:ship']
            },
            uglify: {
                files: ['<%= ts.debug.out %>'],
                tasks: ['ts:debug', 'jasmine:ship']
            },
            test_debug: {
                files: ['<%= jasmine.debug.options.specs %>'],
                tasks: ['jasmine:debug'],
            },
            test_ship: {
                files: ['<%= jasmine.ship.options.specs %>'],
                tasks: ['jasmine:ship'],
            },
        },
    });

    grunt.registerTask('debug', ['ts:debug']);
    grunt.registerTask('ship', ['debug', 'uglify:ship']);
    grunt.registerTask('build', ['debug', 'ship']);
    grunt.registerTask('test', ['jasmine:debug', 'jasmine:ship']);
    grunt.registerTask('all', ['build', 'test']);

    // Default task(s).
    grunt.registerTask('default', 'No default task', function() {
        grunt.log.write('The old default task has been moved to "build" to prevent accidental triggering');
    });
};
