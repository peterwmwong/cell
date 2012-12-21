TODO
====

NEW: Bindings
-------------

- open ended expressions (see angularjs, dart:webui, ember.js)
- localized to a view
  - all model and collection events trigger a debounced updateBinds() (similar angularjs digest())

NEW: View Model on `this`
-------------------------

NEW: ext (see angularjs directives)
-----------------------------------


Finish http://jsperf.com/cell-dispose

Add @collectionEvents, @modelEvents

Ponder over adding @ui
  Pros: 
    - declare ui element accessors (using jQuery selectors)
    - easy/flexible access to ui elements
  Cons: 
    - repeating yourself in most cases
    - extra overhead
    - potentially out of sync unless their functions
    - promoting bad practices? mayhaps

move to camelCase
  
support for $.html()

zepto support for html/empty/remove extension
