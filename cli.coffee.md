Now the CLI:

    gulp = require 'gulp'
    gribbl = require './api'

    gulp.src process.argv[2..]
    .pipe gribbl()
    .pipe gulp.dest '.'
