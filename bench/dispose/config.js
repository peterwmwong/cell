require.config({
  paths:{
    cell: '../../build/cell',
    jquery: '../../support/jquery',
    underscore: '../../node_modules/underscore/underscore',
    backbone: '../../support/backbone.master'
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
    './Main'
  ]
})