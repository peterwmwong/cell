require.config({
  context: 'specRunner', // TODO rename spec-runner
  baseUrl: '/spec-runner/',
  paths: {
    'SpecHelpers': '../spec-runner/SpecHelpers',
    'spec': '../spec-runner/spec',
    'cell': '../build/cell',
    '__': '../build/__',
    jquery: '../support/jquery',
    underscore: '../support/lodash.custom',
    backbone: '../node_modules/backbone/backbone'
  },
  shim: {
    'underscore': {
      "deps": ["jquery"],
      "exports": '_'
    },
    'backbone': {
      "deps": ["underscore", "jquery"],
      "exports": "Backbone"  //attaches "Backbone" to the window object
    }
  },
  deps: [
    'SpecRunner'
  ]
});