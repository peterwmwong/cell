TODO
====

Finish css! plugin

Finish http://jsperf.com/cell-dispose

Revisit __.bind API and implementation
  - Alternatives
    -  Model reference ref()
      - goal: Abstracting access to a value derived from a Model attribute or attributes
        - View render binding
      - method: Backbone.Model::ref( {attr:String | attrs:String[]}, transform:Function )
      - ideas:
      - examples:
        - View render binding
          ```
          render_el: (__)-> [
            // Simple referencing of a single Model attribute
            __ '.myValue', @model.ref 'a'
            __ '.myAttr', attr: @model.ref 'a'
            // Computed value (transform function) of a single Model Attribute
            __ '.myComputedValue', @model.ref 'a', (a)-> "Hello #{a}"
            __ '.myComputedAttr', attr: @model.ref 'a', (a)-> "Hello #{a}"
            // Computed multi-value of multiple Model Attributes
            __ '.myMultiValue', @model.ref 'a','b', (a,b)-> "Goodbye #{a} and #{b}"
            __ '.myMultiAttr', attr: @model.ref 'a','b', (a,b)-> "Goodbye #{a} and #{b}"
          ]
          ```
        - Backbone.View::model_refs
          ```
          Backbone.View.extend
            initialize: ->
              @abc_computed_ref = @model.ref 'a','b','c', (a,b,c)-> "Yolo #{a}, #{b}, and #{c}"
              @a_ref = @model.ref 'a'
            model_refs:
              abc_computed_ref: [ 'a','b','c', (a,b,c)-> "Yolo #{a}, #{b}, and #{c}" ]
              a_ref: 'a'
          ```
          ```
          Backbone.View.extend({
            initialize: function(){
              this.abc_computed_ref =  this.model.ref( 'a','b','c', function(a,b,c){ return "Yolo #{a}, #{b}, and #{c}"; } );
              this.a_ref =  this.model.ref('a');
            },
            model_refs: {
              abc_computed_ref: [ 'a','b','c', function(a,b,c){ return "Yolo #{a}, #{b}, and #{c}"; } ],
              a_ref: 'a'
            }
          });
          ```
        - ref of refs
          - single
            ```
            aRef = model.ref 'a'
            computed_aRef = aRef.ref (a)-> "Hello #{a}"
            ```
          - multi
            ```
            a_ref = model.ref 'a'
            b_ref = model2.ref 'b'
            c_ref = model2.ref 'c'
            ab_ref = aRef.combine bRef, (a,b)->
            abc_ref = aRef.combine [bRef, cRef], (a,b,c)->
            ```

Cell as a Backbone.View
  - usage
    ```
    define function(require){
      var Cell = require('Cell');
      Cell.extend(require, {
        // Stuff
      });
    })
    ```

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
