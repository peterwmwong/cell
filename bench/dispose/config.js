require.config({
  paths:{
    cell: '../../build/cell',
    jquery: '../../support/jquery',
    underscore: '../../support/lodash.custom',
    backbone: '../../node_modules/backbone/backbone'
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