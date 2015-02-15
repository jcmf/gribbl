// Generated by IcedCoffeeScript 1.8.0-c
(function() {
  var assert, data_uri, ext_to_type, is_urlsafe_with_squote, is_urlsafe_without_squote, jpg_buf, prefixes_by_first_byte, t,
    __slice = [].slice;

  module.exports = function(contents, opts) {
    var base64, base64_len, byte, chars, charset, entries, entry, fragment, hex, is_urlsafe, limit, m, non_base64_len, path, type, type_has_charset, _i, _j, _len, _len1, _ref, _ref1;
    path = null;
    if (contents && !opts) {
      _ref = 'object' !== typeof contents ? [contents, {}] : contents.contents ? [contents.contents, contents] : (path = contents.path || contents.filename) ? [null, contents] : [contents, {}], contents = _ref[0], opts = _ref[1];
    }
    path || (path = opts.path || opts.filename);
    if (contents == null) {
      contents = require('fs').readFileSync(path);
    }
    type = opts.type || opts.mime_type || opts.content_type || '';
    charset = opts.charset || opts.encoding;
    m = /;\s*charset\s*=\s*['"]?([^\s"';]+)/i.exec(type);
    type_has_charset = !!m;
    if (type_has_charset) {
      charset || (charset = m[1]);
    }
    if ('string' === typeof contents) {
      contents = new Buffer(contents, opts.encoding || opts.charset || 'utf8');
      charset || (charset = 'UTF-8');
    }
    if (!type && path && (m = /\.([^./\\]+)$/.exec(path))) {
      type = ext_to_type[m[1].toLowerCase()];
    }
    if (!type && contents.length) {
      entries = prefixes_by_first_byte[contents[0]];
      if (entries) {
        for (_i = 0, _len = entries.length; _i < _len; _i++) {
          entry = entries[_i];
          if (entry.prefix.equals(contents.slice(0, entry.prefix.length))) {
            type = entry.type;
            break;
          }
        }
      }
    }
    type || (type = charset ? 'text/plain' : 'application/octet-stream');
    if (!opts.no_default_charset) {
      charset || (charset = opts.default_charset || 'UTF-8');
    }
    if (charset && !type_has_charset && /^text\//.test(type)) {
      type = "" + type + ";charset=" + charset;
    }
    is_urlsafe = opts.allow_single_quotes ? is_urlsafe_with_squote : is_urlsafe_without_squote;
    base64 = opts.base64;
    if ((base64 == null) || base64 === 'auto') {
      limit = opts.max_scan_bytes || 0;
      if (limit <= 0) {
        limit = contents.length;
      }
      limit = Math.min(contents.length, limit);
      base64_len = 7 + 4 * Math.ceil(limit / 3);
      non_base64_len = limit;
      _ref1 = contents.slice(0, limit);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        byte = _ref1[_j];
        if (!is_urlsafe[byte]) {
          non_base64_len += 2;
        }
        if (non_base64_len > base64_len) {
          break;
        }
      }
      base64 = base64_len < non_base64_len;
    }
    fragment = opts.fragment || '';
    if (fragment && fragment[0] !== '#') {
      fragment = '#' + fragment;
    }
    if (base64) {
      return "data:" + type + ";base64," + (contents.toString('base64')) + fragment;
    }
    hex = opts.lowercase_hex ? '0123456789abcdef' : '0123456789ABCDEF';
    chars = (function() {
      var _k, _len2, _results;
      _results = [];
      for (_k = 0, _len2 = contents.length; _k < _len2; _k++) {
        byte = contents[_k];
        if (is_urlsafe[byte]) {
          _results.push(String.fromCharCode(byte));
        } else {
          _results.push("%" + hex[byte >> 4] + hex[byte & 0xf]);
        }
      }
      return _results;
    })();
    return "data:" + type + "," + (chars.join('')) + fragment;
  };

  is_urlsafe_with_squote = [];

  is_urlsafe_without_squote = [];

  is_urlsafe_with_squote["'".charCodeAt(0)] = true;

  (function() {
    var byte, ch, _i, _len, _ref, _results;
    _ref = "-_.!~*();/?:@&=+$,0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz";
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ch = _ref[_i];
      byte = ch.charCodeAt(0);
      is_urlsafe_with_squote[byte] = true;
      _results.push(is_urlsafe_without_squote[byte] = true);
    }
    return _results;
  })();

  ext_to_type = {};

  prefixes_by_first_byte = [];

  (function() {
    var ext, magic, prefix, type, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = [
      {
        type: 'text/plain',
        exts: 'txt'
      }, {
        type: 'text/html',
        exts: 'html htm',
        prefix: '<!DOCTYPE html>'
      }, {
        type: 'text/javascript',
        exts: 'js'
      }, {
        type: 'text/css',
        exts: 'css'
      }, {
        type: 'image/gif',
        prefixes: ['GIF87a', 'GIF89a']
      }, {
        type: 'image/jpeg',
        exts: 'jpg jpeg',
        prefix: [0xff, 0xd8, 0xff]
      }, {
        type: 'image/png',
        prefix: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
      }, {
        type: 'application/font-woff',
        prefix: 'wOFF'
      }
    ];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      magic = _ref[_i];
      type = magic.type;
      _ref1 = (magic.exts || /\w+$/.exec(magic.type)[0]).split(/\s+/);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        ext = _ref1[_j];
        ext_to_type[ext] = type;
      }
      _results.push((function() {
        var _k, _len2, _name, _ref2, _results1;
        _ref2 = magic.prefixes || [magic.prefix];
        _results1 = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          prefix = _ref2[_k];
          if (prefix) {
            prefix = new Buffer(prefix);
            _results1.push((prefixes_by_first_byte[_name = prefix[0]] || (prefixes_by_first_byte[_name] = [])).push({
              prefix: prefix,
              type: type
            }));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      })());
    }
    return _results;
  })();

  if (module === require.main) {
    assert = require('assert');
    data_uri = module.exports;
    t = function() {
      var args, expected;
      expected = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return assert.strictEqual(expected, data_uri.apply(null, args));
    };
    t('data:text/plain;charset=UTF-8,foobar', 'foobar');
    t('data:text/plain;charset=UTF-8;base64,Zm9vYmFy', 'foobar', {
      base64: true
    });
    t('data:text/plain;charset=ascii,foobar', {
      contents: 'foobar',
      charset: 'ascii'
    });
    t('data:text/plain;charset=bogus,foobar', {
      contents: 'foobar',
      charset: 'bogus',
      encoding: 'utf8'
    });
    t('data:text/plain;charset=bogus,foobar', 'foobar', {
      type: 'text/plain;charset=bogus',
      encoding: 'utf8'
    });
    t('data:text/plain;charset=UTF-8,foobar', 'foobar', {
      no_default_charset: true
    });
    t('data:application/octet-stream,foobar', new Buffer('foobar'));
    t('data:text/plain;charset=UTF-8,foobar', new Buffer('foobar'), {
      filename: 'foo.txt'
    });
    t('data:text/plain;charset=UTF-8,foobar', new Buffer('foobar'), {
      path: 'foo.txt'
    });
    t('data:image/gif,foobar', new Buffer('foobar'), {
      path: 'foo.gif'
    });
    t('data:text/plain,foobar', new Buffer('foobar'), {
      path: 'foo.txt',
      no_default_charset: true
    });
    t('data:image/gif,GIF89a%20foobar', 'GIF89a foobar');
    t('data:application/font-woff,wOFF%20foobar', 'wOFF foobar');
    t('data:text/html;charset=UTF-8,%3C!DOCTYPE%20html%3E', '<!DOCTYPE html>');
    jpg_buf = function() {
      var bytes;
      bytes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return new Buffer([0xff, 0xd8, 0xff, 0xe0].concat(__slice.call(bytes)));
    };
    t('data:image/jpeg,%FF%D8%FF%E0', jpg_buf());
    t('data:image/jpeg,%ff%d8%ff%e0', jpg_buf(), {
      lowercase_hex: true
    });
    t('data:image/jpeg,%FF%D8%FF%E0%FF', jpg_buf(0xff));
    t('data:image/jpeg;base64,/9j/4P8A', jpg_buf(0xff, {
      base64: true
    }));
    t('data:image/jpeg;base64,/9j/4P//', jpg_buf(0xff, 0xff));
    t('data:image/jpeg;base64,/9j/4P///w==', jpg_buf(0xff, 0xff, 0xff));
    t('data:image/jpeg,%FF%D8%FF%E0%FF%FF', jpg_buf(0xff, 0xff), {
      base64: false
    });
    t('data:text/javascript;charset=UTF-8,' + 'exports.msg%20=%20%27helloes%20worldses%27;%0A', {
      filename: 'test.js'
    });
    t('data:text/javascript;charset=UTF-8,' + 'exports.msg%20=%20%27helloes%20worldses%27;%0A', {
      path: 'test.js'
    });
    t('data:foo/bar,foobar', 'foobar', {
      type: 'foo/bar'
    });
    t('data:foo/bar,foobar', 'foobar', {
      mime_type: 'foo/bar'
    });
    t('data:foo/bar,foobar', 'foobar', {
      content_type: 'foo/bar'
    });
    t('data:text/bar;charset=UTF-8,foobar', 'foobar', {
      type: 'text/bar'
    });
    t("data:text/plain;charset=UTF-8,isn%27t", "isn't");
    t("data:text/plain;charset=UTF-8,isn't", "isn't", {
      allow_single_quotes: true
    });
    t('data:text/plain;charset=UTF-8,foobar#foo', 'foobar', {
      fragment: 'foo'
    });
    t('data:text/plain;charset=UTF-8,foobar#foo', 'foobar', {
      fragment: '#foo'
    });
    t('data:text/plain;charset=UTF-8,foobar#', 'foobar', {
      fragment: '#'
    });
    t('data:text/plain;charset=UTF-8,foobar', 'foobar', {
      fragment: ''
    });
    t('data:text/plain;charset=UTF-8,foobar', 'foobar', {
      fragment: null
    });
  }

}).call(this);
