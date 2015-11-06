module.exports = function (grunt) {
    grunt.initConfig({
        uglify: {
            main: {
                files: {
                    "join/js/main.min.js": "join/js/main.js",
                    "play/js/main.min.js": "play/js/main.js"
                }
            }
        }
    })

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.registerTask("default", ["uglify"]);
}