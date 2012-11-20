({
  paths:{
    requireLib: '../../../node_modules/requirejs/require',
    'cell-builder-plugin': '../../../build/cell-builder-plugin',
    cell: '../../../build/cell',
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
  include: [
    'requireLib',
    'underscore',
    'backbone'
  ],
  name: 'cell!Mock',
  optimize: "none",
  out: 'all.js'
})