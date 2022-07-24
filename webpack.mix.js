const mix = require('laravel-mix');
const MixGlob = require('laravel-mix-glob');
const mixGlob = new MixGlob({mix});
mixGlob
  .js('src/js/app.js', 'assets')
  .sass('src/scss/app.scss', 'assets')
  .sass('src/scss/dawn/**.scss', 'assets')
