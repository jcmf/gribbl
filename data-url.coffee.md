Routines for building (data: URLs)[http://tools.ietf.org/html/rfc2397].
This depends on nothing much and could/should probably be its own
npm package at some point.

I want something that can do %-encoding (vs base64) when doing so
makes sense, that can identify at least some of the MIME types I
care about based on file contents rather than relying solely on
file names, and that is small and fast and has few dependencies.
I guess stream support might be nice too.

Let's just let the module's entire API consist of a single function
that encodes its first argument and returns the resulting URL as a
string, taking an options object as a second argument.  Both arguments
are optional -- for example if you just wanted to read from a file,
you can specify the `path` option (or `filename`) and omit `contents`
(or leave it null).

    module.exports = (contents, opts) ->
      path = null
      if contents and not opts then [contents, opts] =
        if 'object' != typeof contents then [contents, {}]
        else if contents.contents then [contents.contents, contents]
        else if path = contents.path or contents.filename then [null, contents]
        else [contents, {}]
      path or= opts.path or opts.filename
      contents ?= require('fs').readFileSync path

If the caller was kind enough to spoon-feed us a MIME content-type,
let's figure out whether it has a `charset` in it already, so we
can avoid redundantly adding a second one later, and so we can use
it to properly encode `contents` passed in as a string.

      type = opts.type or opts.mime_type or opts.content_type or ''
      charset = opts.charset or opts.encoding
      type_has_charset = false
      if not charset and m = /;\s*charset\s*=\s*['"]?([^\s"';]+)/i.match type
        type_has_charset = true
        charset = m[1]

The contents can be a buffer or a string.  If it's a string, we'll
default to UTF-8 encoding (which MIME prefers to spell that way,
rather than as "utf8", so we'll go with that unless instructed
otherwise).

      if 'string' is typeof contents
        contents = new Buffer contents, opts.encoding or opts.charset or 'utf8'
        charset or= 'UTF-8'

Now we're ready to figure out the MIME content-type.  Obviously if
we were given a type, we should just use that.  Next preference is
to use a filename suffix, if we have a recognizable one, if only
because that isn't likely to surprise anyone.

      if not type and path and m = /\.([^./\\]+)$/.match path
        type = ext_to_type[m[1].toLowerCase()]

If that doesn't work, look for magic numbers at the start of the contents.

      if not type and contents.length
        entries = prefixes_by_first_byte[contents[0]]
        if entries
          for entry in entries
            if entry.prefix.equals contents[...entry.prefix.length]
              type = entry.type
              break

If we're still drawing a blank, default to a generic text type if we
have a charset (or were given a string instead of a buffer), binary
otherwise.

      type or= if charset then 'text/plain' else 'application/octet-stream'

If we're using a textual content-type, and we have or were given a
charset, append it now.

      if charset and not type_has_charset and /^text\//.test type
        type = "#{type};charset=#{charset}"

Decide whether we're going to treat single-quotes as URL-safe
characters or not.  Technically they don't need to be URL-encoded,
but doing so now is shorter than entity-encoding them later.  Let's
default to escaping them, just to be safe.

      is_urlsafe = if opts.allow_single_quotes then is_urlsafe_with_squote
      else is_urlsafe_without_squote

Next, figure out whether we want to use base64 or not.  If the
caller is telling us what to do, go with that.  Otherwise, figure
out whether URL-encoding would be shorter by scanning the buffer.

      base64 = options.base64
      if not base64? or base64 == 'auto'
        limit = opts.limit or 0
        limit = contents.length if limit <= 0
        limit = Math.min contents.length, limit
        base64_len = 7 + Math.ceil limit*4/3
        non_base64_len = limit
        for byte in contents[...limit]
          if not is_urlsafe[byte] then non_base64_len += 2
          if non_base64_len > base64_len then break
        base64 = base64_len < non_base64_len

Ready to encode.  Base64 is easy, bceause the Buffer module does
all the work.

      if base64 then return "#{type};base64,#{contents.toString 'base64'}"

URL encoding is slightly more complicated, because we're doing it
by hand.  Which means we may as well let the caller decide whether
they want lowercase hex or not.  I'm defaulting to uppercase because
I feel like uppercase typically stands out a bit better, assuming
most of the unescaped text is lowercase.

      hex = if opts.lowercase_hex then '0123456789abcdef'
      else '0123456789ABCDEF'
      chars = for byte in contents
        if is_urlsafe[byte] then String.fromCharCode byte
        else "%#{hex[byte >> 4]}#{hex[byte & 0xf]}"
      return "#{type},#{chars.join ''}"

That's it for our API function.  All that remains is a bit of
one-time module initialization.

Initialize our two sets of URL-safe byte values.

    is_urlsafe_with_squote = []
    is_urlsafe_without_squote = []
    is_urlsafe_with_squote["'".charCodeAt 0] = true
    do -> for ch in ("-_.!~*();/?:@&=+$,0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz")
      byte = ch.charCodeAt 0
      is_urlsafe_with_squote[byte] = true
      is_urlsafe_without_squote[byte] = true

Initialize our dictionary of known content types.

    ext_to_type = {}
    prefixes_by_first_byte = []
    do -> for magic in [
      {type: 'text/plain', exts: 'txt'}
      {type: 'text/html', exts: 'html htm', prefix: '<!DOCTYPE html>'}
      {type: 'text/javascript', exts: 'js'}
      {type: 'text/css', exts: 'css'}
      {type: 'image/gif', prefixes: ['GIF87a', 'GIF89a']}
      {type: 'image/jpeg', exts: 'jpg jpeg', prefix: [0xff, 0xd8, 0xff]}
      {type: 'image/png', prefix: [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]}
      {type: 'application/font-woff', prefix: 'wOFF'}
    ]
      type = magic.type
      for ext in (magic.exts or /\w+$/.match(magic.type)[0]).split /\s+/
        ext_to_type[ext] = type
      for prefix in magic.prefixes or [magic.prefix]
        if prefix
          prefix = new Buffer prefix
          (prefixes_by_first_byte[prefix[0]] or= []).append {prefix, type}

