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

      text = String file.contents
      if /\.jade$/.test inPath
        try
          text = require('jade').render text, filename: inPath, pretty: yes
        catch e
          return fail e
        text += '\n'

We're going to use `cheerio`, a jQuery-like library that works on
strings of HTML rather than a browser DOM, to help us find things
in the HTML that need inlining.  (If Jade worked with streams, I
might try `trumpet` here instead.  But it doesn't.)

      $ = require('cheerio').load text

Find script tags and browserify them.  For now I'm just going to
process script tag contents; I'll leave `src=` inlining for later.
I'm also not going to worry about `type` just yet.

      for script in $('script').get()
        $script = $ script

Browserify wants a stream, not a string, and wants basedir but not
the actual file name.

        jsStream = new require('stream').Readable()
        jsStream._read = ->
        jsStream.push $script.html()
        jsStream.push null
        basedir = require('path').dirname inPath
        b = require('browserify') {basedir, entries: [jsStream], debug: yes}
        await b.bundle defer err, buf
        if err then fail err
        $script.replaceWith "<script>#{buf}</script>"

Inline any relative images as data: URIs.

      for img in $('img[src]').get()
        $img = $ img
        oldUri = $img.attr 'src'
        if /^(?:\w[\w+.-]*:|\/)/.test oldUri then continue
        localPath = require('path').resolve inPath, '..', oldUri
        newUri = require('./data-uri') path: localPath
        $img.attr 'src', newUri

Convert the DOM back to text, convert that to a buffer, and write
it to the output file.

      text = $.html()
      file.contents = new Buffer text
      cb null, file

