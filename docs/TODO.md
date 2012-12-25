TODO
====

NEW: bind() Bound expressions
-----------------------------

- open ended expressions (see angularjs, dart:webui, ember.js)
- localized to a view
  - all model and collection events trigger a debounced updateBinds() (similar angularjs digest())

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