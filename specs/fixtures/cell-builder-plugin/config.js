require.config({
  paths:{
    requireLib: '../../../build/require',
    cell: '../../../build/cell',
    'cell-builder-plugin': '../../../build/cell-builder-plugin',
    jquery: '../../../support/jquery',
    underscore: '../../../support/lodash.custom',
    backbone: '../../../node_modules/backbone/backbone'
  },
  shim: {
    'underscore': {
      "exports": '_'
    },
    'backbone': {
      "deps": ["underscore"],
      "exports": "Backbone"  //attaches "Backbone" to the window object
    }
  },
  deps: [
    'App'
  ]
})