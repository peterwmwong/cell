({
  paths:{
    requireLib: '../../build/require',
    dom: '../../build/dom',
    underscore: '../../support/lodash.custom'
  },
  shim: {
    'underscore': {
      "exports": '_'
    }
  },
  include: [
    'requireLib'
  ],
  deps: [
    'dom'
  ],
  optimize: "none",
  out: 'built-dom.js'
})