/*
 * Update semantic version in package.json, composer.json, plugin and readme.txt
 */

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    version: {
      project: {
        src: ["package.json", "composer.json"],
      },
      plugin: {
        options: {
          prefix: "Version:\\s+",
        },
        src: ["<%= pkg.name %>.php"],
      },
      readme: {
        options: {
          prefix: "Stable tag:\\s+",
        },
        src: ["readme.txt"],
      },
    },
  });

  //load modules
  grunt.loadNpmTasks("grunt-version");

  grunt.registerTask("syntax", "default task description", function () {
    console.log(
      "Update version number:\n" +
        "\tgrunt patch (update patch version in pacjage.json, composer.json, plugin and readme.txt)\n" +
        "\tgrunt version (read version from pacjage.json and update version in plugin and readme.txt)\n" +
        "\tgrunt version:project:patch  (update patch version in project.json)\n" +
        "\tgrunt version:minor  (update minor version in project.json, plugin and readme.txt)\n" +
        "\tgrunt version:major  (update major version in project.json, plugin and readme.txt)\n"
    );
  });

  grunt.registerTask("default", ["syntax"]);
  grunt.registerTask("patch", ["version:project:patch", "version"]);
};
