// Generated by IcedCoffeeScript 1.8.0-c
(function() {
  var iced, __iced_k, __iced_k_noop;

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  module.exports = function() {
    return require('through2').obj(function(file, enc, cb) {
      var $, PluginError, e, fail, inPath, replaceExtension, text, _ref;
      _ref = require('gulp-util'), PluginError = _ref.PluginError, replaceExtension = _ref.replaceExtension;
      fail = function(e) {
        return cb(new PluginError('gribbl', e));
      };
      if (file.isStream()) {
        return fail('streaming not supported');
      }
      inPath = file.path;
      file.path = replaceExtension(file.path, '.html');
      if (!file.isBuffer()) {
        return cb(null, file);
      }
      try {
        text = String(file.contents);
        if (/\.jade$/.test(inPath)) {
          text = require('jade').render(text, {
            filename: inPath,
            pretty: true
          });
          text += '\n';
        }
        $ = require('cheerio').load(text);
        $('script').each(function() {
          var b, basedir, buf, el, err, js, jsStream, ___iced_passed_deferral, __iced_deferrals, __iced_k;
          __iced_k = __iced_k_noop;
          ___iced_passed_deferral = iced.findDeferral(arguments);
          el = $(this);
          js = el.text();
          jsStream = new require('stream').Readable();
          jsStream._read = function() {};
          jsStream.push(js);
          jsStream.push(null);
          basedir = require('path').dirname(inPath);
          console.log("XXX basedir=" + basedir);
          b = require('browserify')({
            basedir: basedir,
            entries: [jsStream],
            debug: true
          });
          (function(_this) {
            return (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/zaphod/github/gribbl/api.coffee.md"
              });
              b.bundle(__iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    err = arguments[0];
                    return buf = arguments[1];
                  };
                })(),
                lineno: 57
              }));
              __iced_deferrals._fulfill();
            });
          })(this)((function(_this) {
            return function() {
              if (err) {
                fail(err);
              }
              js = String(buf);
              return el.text(js);
            };
          })(this));
        });
        text = $.html();
      } catch (_error) {
        e = _error;
        return fail(e);
      }
      file.contents = new Buffer(text);
      return cb(null, file);
    });
  };

}).call(this);
