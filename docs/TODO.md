TODO
====

NEW: Cell::renderRoot()
-----------------------

Optional function to define when you want to control how a Cell's root element (@el) is rendered
Elements produced by renderEl() will be the contents.

    ...
    renderRoot: (__)->
      __ 'input', type:'checkbox', checked:(-> @model.get 'done')
    ...


NEW: __.if() __.each()
----------------------
    
    ...
    renderEl: -> [
      __.if (-> @model.loaded),
        then:-> __ '.true'
        else:->  __ '.false'
    ]
    ...

    ...
    renderEl: -> [
      __.each @collection, (item)->
        __ View, model: item

      __.each @collection, (item)->
        __ 'div#myid.myclass', item

      __.repeat View, @collection, (item)->
      __.repeat View, @collection
      __.repeat 'div#myid.myclass', @collection
    ...


NEW: exts (see angularjs directives)
-----------------------------------

    __ '.todo', x_class(done:-> @model.get 'done')

### __ API change

    __( Selector, [exts:cell.Ext...], [attributes:object], [children...] )
    __( View, [exts:cell.Ext...], [options:object], [children...] )

### cell.Ext

    cell.Ext.extend
      initialize: (element, parentView, args...)->


NEW: dom
----------------------------

- build off of jqLite/jQuery API
- build off of AngularJS's jqLite specs
- Increase speed
- Decrease size
- Finish off...
  - val()
  - html()
  - text()
  - hasClass()

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

NEW: zepto compat
-----------------

support for html/empty/remove (jQuery.cleanData())