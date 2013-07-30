module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            files: ['js/*.ts', 'web_accessible_resources/*.ts'],
            tasks: ['typescript:base']
        },
        typescript: {
            base: {
                 src: ['**/*.ts'],
                 options: {
                     sourcemap: true,
                     declaration: false
                 }
             }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
};
