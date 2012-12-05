require.config({
  paths:{
    requireLib: '../../../build/require',
    cell: '../../../build/cell',
    'cell-builder-plugin': '../../../build/cell-builder-plugin',
    css: '../../../build/css',
    cssPluginBuilder: '../../../build/cssPluginBuilder',
    __: '../../../build/__',
    jquery: '../../../support/jquery',
    underscore: '../../../node_modules/underscore/underscore',
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
    '__',
    'App'
  ]
})