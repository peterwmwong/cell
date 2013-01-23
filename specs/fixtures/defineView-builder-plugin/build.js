({
  mainConfigFile: 'config.js',
  name: '../../../src/almond',
  optimize: 'uglify2',
  out: 'all.js',
  wrap: {
    endFile: 'wrapEndFile.js'
  }
})