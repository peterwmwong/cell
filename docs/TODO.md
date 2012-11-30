TODO
====

Finish http://jsperf.com/cell-dispose

Revisit __.bind API and implementation
  Is __ the right home for bind?

Update dependencies
  - coffee-script

Assess arguments to __ render function
  Currently
    __( selector:string, [attributes:object], [children...:DOM Elements] )
    AND
    __( [view:Backbone.View], [selector:string], [options:object] )

  Should be...
    __( selector:string, [view:Backbone.View], [attributes/options:object], [children...:DOM Elements])

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
