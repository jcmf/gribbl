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

Define a subroutine that takes a URI, returns null if we don't want
to inline it (because it isn't relative), and otherwise reads the
corresponding local file and returns the data.  Also a version that
doesn't read the data, because sometimes we want to let browserify
do that part instead.

      resolvePath = (url, basePath = inPath) ->
        if /^(?:\w[\w+.-]*:|\/)/.test url then return
        require('path').resolve basePath, '..', url
      readUrl = (url, encoding, basePath) ->
        if path = resolvePath url, basePath
          {path, contents: require('fs').readFileSync path, encoding}

In many cases we're going to want to convert the object returned by
`readUrl` into a `data:` URI.

      toUrl = (options) -> if options then require('./data-uri') options
      fixUrl = (url, basePath) -> toUrl readUrl url, null, basePath

A routine to inline URLs in CSS.  Modifies an object returned by
readUrl in-place, and returns true if anything changed.

      fixCSS = (opts) ->
        orig = opts.contents
        opts.contents = orig.replace /\burl\s*\(\s*(["']?)([^()'"]+)\1\s*\)/g,
          (s, q, u) -> if u = fixUrl u, opts.path then """url("#{u}")""" else s
        orig is opts.contents

[Maybe I should try to find a real CSS parser instead of using a
heuristic?  The routine above might apply spurious subsitutions to
comments or literal text (e.g. `content`), and it doesn't understand
backslash-escaping.  Also I'm pretty sure URLs are allowed to contain
unescaped parentheses and single quotes.]

For HTML, we're going to use `cheerio`, a jQuery-like library that
works on strings of HTML rather than a browser DOM, to help us find
things in the HTML that need inlining.  (If Jade worked with streams,
I might try `trumpet` here instead.  But it doesn't.)

      $ = require('cheerio').load text

Inline any relative images as data: URIs.

      for img in $('img[src]').get()
        $img = $ img
        if url = fixUrl $img.attr 'src' then $img.attr 'src', url

Inline any relative URLs we find in already-inlined stylesheets.
Note that we want to do this *before* inlining external stylesheets,
because these URLs are relative to the parent HTML document, not
relative to the external stylesheet.

      for style in $('style')
        $style = $ style
        css = contents: $style.html()
        if fixCSS css then $style.replaceWith "<style>#{css.contents}</style>"

[Unfortunately the above ends up destroying any attributes of the
`style` tag whenever we rewrite any URLs.  I should probably fix
that.  Unfortunately `cheerio` seems to get upset if I pass non-HTML
as input to the `.html` method.  But I don't think I can use `.text`,
because the contents of a style tag are *forbidden* from following
the usual HTML escaping conventions.]

Inline external stylesheets as `style` tags, while correctly inlining
any URLs they contain.

      for link in $('link[href][rel="stylesheet"]')
        $link = $ link
        url = $link.attr 'href'
        if css = readUrl url, 'utf8'
          fixCSS css
          $link.replaceWith "<style>#{css.contents}</style>"

Find script tags and browserify them.  If the script is external,
let Browserify read the file itself.  Otherwise, we need to pass
in a stream, not a string, and give it the directory the stream
came from, but not an actual file name.

      for script in $('script').get()
        bopts = debug: yes
        $script = $ script
        if url = $script.attr 'src'
          entry = resolvePath url
          if not entry then continue
        else
          entry = new require('stream').Readable()
          entry._read = ->
          entry.push $script.html()
          entry.push null
          bopts.entries = [entry]
          bopts.basedir = require('path').dirname inPath
        bopts.entries = [entry]
        b = require('browserify') bopts
        await b.bundle defer err, buf
        if err then fail err
        $script.replaceWith "<script>#{buf}</script>"

Convert the DOM back to text, convert that to a buffer, and write
it to the output file.

      text = $.html()
      file.contents = new Buffer text
      cb null, file
