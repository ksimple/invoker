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
            }
        },
        jasmine: {
            debug: {
                src: '<%= ts.debug.out %>',
                options: {
                    specs: 'test/*.spec.js',
                },
            },
        },
        watch: {
            ts: {
                files: ['<%= ts.debug.src %>'],
                tasks: ['ts:debug', 'jasmine:debug']
            },
            test: {
                files: ['<%= jasmine.debug.options.specs %>'],
                tasks: ['jasmine:debug'],
            },
        },
    });

    grunt.registerTask('debug', ['ts:debug']);
    grunt.registerTask('test', ['jasmine:debug']);

    // Default task(s).
    grunt.registerTask('default', 'No default task', function() {
        grunt.log.write('The old default task has been moved to "build" to prevent accidental triggering');
    });
};
