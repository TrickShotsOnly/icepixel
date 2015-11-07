module.exports = function (grunt) {
    grunt.initConfig({
        uglify: {
            main: {
                files: {
                    "view/js/main.min.js": "view/js/main.js"
                }
            }
        }
    })

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.registerTask("default", ["uglify"]);
}