require.config({
  paths:{
    requireLib: '../../../build/require',
    cell: '../../../build/cell',
    'cell-builder-plugin': '../../../build/cell-builder-plugin',
    css: '../../../build/css',
    cssPluginBuilder: '../../../build/cssPluginBuilder',
    __: '../../../build/__',
    ref: '../../../build/ref',
    jquery: '../../../support/jquery',
    underscore: '../../../support/lodash.custom',
    backbone: '../../../node_modules/backbone/backbone'
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
    'App'
  ]
})