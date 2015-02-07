First, a gulp-flavored API:

    module.exports = -> require('through2').obj (file, enc, cb) ->
      {PluginError, replaceExtension} = require 'gulp-util'
      fail = (e) -> cb new PluginError 'gribbl', e
      if file.isStream() then return fail 'streaming not supported'
      path = file.path
      file.path = replaceExtension file.path, '.html'
      if not file.isBuffer() then return cb null, file
      try
        text = String file.contents
        if /\.jade$/.test path
          text = require('jade').render text, filename: path, pretty: yes
        $ = require('cheerio').load text
        $('script').each ->
          el = $ this
          subtext = el.text()
          subtext = "/* script tag munged by gribbl */\n#{subtext}"
          el.text subtext
        text = $.html()
        text += '\n'
      catch e then return fail e
      file.contents = new Buffer text
      cb null, file
