TODO
====

NEW: __.if __.repeat
--------------------
    
    ...
    renderEl: -> [
      __.if (-> @model.loaded),
        then:-> __ '.true'

        else:->  __ '.false'
    ]
    ...

    ...
    renderEl: -> [
      __.each (-> @collection), (item)->
        __ View, model: item
    ...

NEW: dom
----------------------------

- build off of jqLite/jQuery API
- build off of AngularJS's jqLite specs
- Increase speed
- Decrease size

TEST: Testacular
----------------

NEW: exts (see angularjs directives)
-----------------------------------

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