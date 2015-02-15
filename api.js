// Generated by IcedCoffeeScript 1.8.0-c
(function() {
  var iced, __iced_k, __iced_k_noop;

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  module.exports = function() {
    return require('through2').obj(function(file, enc, cb) {
      var $, $img, $link, $script, $style, PluginError, b, bopts, buf, css, e, entry, err, fail, fixCSS, fixUrl, img, inPath, link, readUrl, replaceExtension, resolvePath, script, style, text, toUrl, url, ___iced_passed_deferral, __iced_deferrals, __iced_k, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
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
      text = String(file.contents);
      if (/\.jade$/.test(inPath)) {
        try {
          text = require('jade').render(text, {
            filename: inPath,
            pretty: true
          });
        } catch (_error) {
          e = _error;
          return fail(e);
        }
        text += '\n';
      }
      resolvePath = function(url, basePath) {
        var m;
        if (basePath == null) {
          basePath = inPath;
        }
        if (/^(?:\w[\w+.-]*:|\/)/.test(url)) {
          return;
        }
        if (!(m = /(^[^#]+)(#.*)?/.exec(url))) {
          return;
        }
        return {
          fragment: m[2],
          path: require('path').resolve(basePath, '..', m[1])
        };
      };
      readUrl = function(url, encoding, basePath) {
        var result;
        if (!(result = resolvePath(url, basePath))) {
          return;
        }
        result.contents = require('fs').readFileSync(result.path, encoding);
        return result;
      };
      toUrl = function(options) {
        if (options) {
          return require('./data-uri')(options);
        }
      };
      fixUrl = function(url, basePath) {
        return toUrl(readUrl(url, null, basePath));
      };
      fixCSS = function(opts) {
        var orig;
        orig = opts.contents;
        opts.contents = orig.replace(/\burl\s*\(\s*(["']?)([^()'"]+)\1\s*\)/g, function(s, q, u) {
          if (u = fixUrl(u, opts.path)) {
            return "url(\"" + u + "\")";
          } else {
            return s;
          }
        });
        return orig === opts.contents;
      };
      $ = require('cheerio').load(text);
      _ref1 = $('img[src]').get();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        img = _ref1[_i];
        $img = $(img);
        if (url = fixUrl($img.attr('src'))) {
          $img.attr('src', url);
        }
      }
      _ref2 = $('style');
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        style = _ref2[_j];
        $style = $(style);
        css = {
          contents: $style.html()
        };
        if (fixCSS(css)) {
          $style.replaceWith("<style>" + css.contents + "</style>");
        }
      }
      _ref3 = $('link[href][rel="stylesheet"]');
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        link = _ref3[_k];
        $link = $(link);
        url = $link.attr('href');
        if (css = readUrl(url, 'utf8')) {
          fixCSS(css);
          $link.replaceWith("<style>" + css.contents + "</style>");
        }
      }
      (function(_this) {
        return (function(__iced_k) {
          var _l, _len3, _ref4, _results, _while;
          _ref4 = $('script').get();
          _len3 = _ref4.length;
          _l = 0;
          _results = [];
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = function() {
              return __iced_k(_results);
            };
            _continue = function() {
              return iced.trampoline(function() {
                ++_l;
                return _while(__iced_k);
              });
            };
            _next = function(__iced_next_arg) {
              _results.push(__iced_next_arg);
              return _continue();
            };
            if (!(_l < _len3)) {
              return _break();
            } else {
              script = _ref4[_l];
              bopts = {
                debug: true
              };
              $script = $(script);
              (function(__iced_k) {
                if (url = $script.attr('src')) {
                  (function(__iced_k) {
                    var _ref5;
                    if (!(entry = (_ref5 = resolvePath(url)) != null ? _ref5.path : void 0)) {
                      (function(__iced_k) {
_continue()
                      })(__iced_k);
                    } else {
                      return __iced_k();
                    }
                  })(__iced_k);
                } else {
                  entry = new require('stream').Readable();
                  entry._read = function() {};
                  entry.push($script.html());
                  entry.push(null);
                  bopts.entries = [entry];
                  return __iced_k(bopts.basedir = require('path').dirname(inPath));
                }
              })(function() {
                bopts.entries = [entry];
                b = require('browserify')(bopts);
                (function(__iced_k) {
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
                    lineno: 140
                  }));
                  __iced_deferrals._fulfill();
                })(function() {
                  if (err) {
                    fail(err);
                  }
                  return _next($script.replaceWith("<script>" + buf + "</script>"));
                });
              });
            }
          };
          _while(__iced_k);
        });
      })(this)((function(_this) {
        return function() {
          text = $.html();
          file.contents = new Buffer(text);
          return cb(null, file);
        };
      })(this));
    });
  };

}).call(this);
