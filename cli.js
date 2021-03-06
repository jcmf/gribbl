// Generated by IcedCoffeeScript 108.0.11
(function() {
  var gribbl, gulp, opts;

  opts = require('commander');

  opts.usage('[OPTION...] FILE.(jade|html)...').option('-d | --debug', 'include source maps').option('-o | --output <DIR>', 'set .html output directory').option('-p | --pretty', 'prefer to generate more whitespace').parse(process.argv);

  if (!opts.args.length) {
    opts.help();
  }

  gulp = require('gulp');

  gribbl = require('./api');

  gulp.src(opts.args, {
    nonull: true
  }).pipe(gribbl(opts)).pipe(gulp.dest(opts.output || '.'));

}).call(this);
