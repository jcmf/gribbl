First, a gulp-flavored API:

    module.exports = -> require('through2').obj (file, enc, cb) ->
      {PluginError, replaceExtension} = require 'gulp-util'
      fail = (e) -> cb new PluginError 'gribbl', e
      if file.isStream() then return fail 'streaming not supported'
      if file.isBuffer()
        try
          src = String file.contents
          file.contents = new Buffer jade.compile src, filename: file.path
        catch e
          return fail e
      file.path = replaceExtension file.path, '.html'
      cb null, file
