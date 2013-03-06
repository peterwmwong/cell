({
  mainConfigFile: 'config.js',
  name: '../../../src/almond',
  optimize: 'uglify2',
  outcss: 'all-outcss-filename.css',
  out: 'all-outjs-filename.js',
  wrap: {
    end: "require('App');"
  }
})