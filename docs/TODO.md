TODO
====

BUG: __.if() and __.each() need to call with view as `this`
-----------------------------------------------------------

NEW: exts (see angularjs directives)
-----------------------------------

    __ '.todo', x_class(done:-> @model.get 'done')

### __ API change

    __( Selector, [exts:cell.Ext...], [attributes:object], [children...] )
    __( View, [exts:cell.Ext...], [options:object], [children...] )

### cell/ext

    require('!cell/ext')
      initialize: (element, parentView, args...)->

### exts

- x_class
- x_model


NEW: Cell::renderRoot()
-----------------------

Optional function to define when you want to control how a Cell's root element (@el) is rendered
Elements produced by renderEl() will be the contents.

    ...
    renderRoot: (__)->
      __ 'input', type:'checkbox', checked:(-> @model.get 'done')
    ...


NEW: dom
--------

- build off of jqLite/jQuery API
- build off of AngularJS's jqLite specs
- Increase speed
- Decrease size
- Finish off...
  - val()
  - html()
  - text()
  - hasClass()

NEW: require.js plugin builder layer?
-------------------------------------

Currently the builder plugin (defineView-builder-plugin), hackishly keeps track of a stack to figure out the when it is appropriate to write out the final CSS file.
In recent versions of require.js, a new callback `onLayerEnd()` may be the better approach.

http://requirejs.org/docs/plugins.html#apionlayerend


TEST: Testacular
----------------


Extend html DOM functionality

NEW: `Cell::tpl (__)->`
-----------------------

PERF: cell.remove() and $.cleanData()
-------------------------------------

- Finish http://jsperf.com/cell-dispose

NEW: @collectionEvents, @modelEvents
-------------------------------------

NEW: require.js alt
-------------------

- smaller
- faster
- simpler
  - less config options
- better error reporting
  - couldn't find a dep... for who!?

