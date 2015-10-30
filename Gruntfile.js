module.exports = function(grunt){
	grunt.initConfig({
		uglify: {
			main: {
				files: {
					'view/js/main.min.js': 'js/*.js'
				}
			}
		}
	})

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['uglify']);
}
