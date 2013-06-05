/*
 * grunt-md5versions
 * https://github.com/jstrinko/grunt-md5versions
 *
 * Copyright (c) 2013 Jeff Strinko
 * Licensed under the MIT license.
 */

'use strict';

var Crypto = require('crypto'),
	_ = require('underscore');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('md5versions', 'Building md5 versions', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });
    // Iterate over all specified file groups.
    this.files.forEach(_.bind(function(f) {
      // Concat specified files.
      var src = f.src.filter(_.bind(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }, this)).map(_.bind(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }, this)).join(grunt.util.normalizelf(options.separator));

      // Handle options.
      src += options.punctuation;
			var versions;
			try {
				versions = grunt.file.readJSON(f.dest);
			}
			catch(error) {
				versions = {};
			}
			var md5 = Crypto.createHash('md5');
			md5.update(src);
			var digest = md5.digest('hex');
			console.warn(versions[options.key][options.type] + " VS " + digest);
			if (!versions[options.key]) { 
				versions[options.key] = {};
			}
			if (versions[options.key][options.type] !== digest) {
				// Write the destination file.
				versions[options.key][options.type] = digest;
				grunt.file.write(f.dest, JSON.stringify(versions));
				grunt.log.writeln("Digest updated for " + options.key + " to " + digest);
				if (typeof options.on_change == 'function') {
					try {
						var on_change = _.bind(options.on_change,this);
						on_change()
					}
					catch(error) {
						grunt.error("Unable to run on_change function for " + this.target + ": " + error);
					}
				}
			}
    }, this));
  });

};
