First, a gulp-flavored API.

Seems like nobody bothers to support streaming?  I guess gulp.src()
buffers everything by default.  Just as well, since the Jade API
doesn't support streaming.

    module.exports = -> require('through2').obj (file, enc, cb) ->
      {PluginError, replaceExtension} = require 'gulp-util'
      fail = (e) -> cb new PluginError 'gribbl', e
      if file.isStream() then return fail 'streaming not supported'

Output file name should end with `.html`.  I kinda want to do
something here to allow the input and output filenames to be distinct
in the case where the input is also `.html`, but I'm not going to
worry about that for now.  Certainly, when using this with gulp,
you can apply further renaming or send it to another directory.

      inPath = file.path
      file.path = replaceExtension file.path, '.html'
      if not file.isBuffer() then return cb null, file

If this is a `.jade` file, render it; otherwise assume it's HTML
already.  Jade never ends its output in a newline, which seems
forgiveable when pretty mode is turned off (the default), but when
it's turned on... text files should end in a newline, dammit.

      try
        text = String file.contents
        if /\.jade$/.test inPath
          text = require('jade').render text, filename: inPath, pretty: yes
          text += '\n'

We're going to use `cheerio`, a jQuery-like library that works on
strings of HTML rather than a browser DOM, to help us find things
in the HTML that need inlining.  (If Jade worked with streams, I
might try `trumpet` here instead.  But it doesn't.)

        $ = require('cheerio').load text

Find script tags and browserify them.  For now I'm just going to
process script tag contents; I'll leave `src=` inlining for later.
I'm also not going to worry about `type` just yet.

        $('script').each ->
          el = $ this
          js = el.text()

Browserify wants a stream, not a string, and wants basedir but not
the actual file name.

          jsStream = new require('stream').Readable()
          jsStream._read = ->
          jsStream.push js
          jsStream.push null
          basedir = require('path').dirname inPath
          console.log "XXX basedir=#{basedir}"
          b = require('browserify') {basedir, entries: [jsStream], debug: yes}
          await b.bundle defer err, buf
          if err then fail err
          js = String buf
          el.text js

Convert the DOM back to text.

        text = $.html()

We're going to catch any exceptions thrown by Jade etc and write
them to the gulp stream, because apparently that is somehow better?
Maybe it allows the rest of the pipeline to delete the stale output
file or something?  I'm just copying what everyone else is doing.

      catch e then return fail e
      file.contents = new Buffer text
      cb null, file

