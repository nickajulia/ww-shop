let mix = require('laravel-mix');

mix.js('src/js/app.js', 'assets')
  .sass('src/scss/theme.scss', 'assets')
  .options({ processCssUrls: false });