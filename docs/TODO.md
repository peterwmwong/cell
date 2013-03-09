TODO
====

Revisit: Ext API
----------------

### Problem

The current Ext API seems very different in it's API design, than say View, Model, or Collection.

### Proposed Solution

Let's carry over design elements of the View API into Ext API.

- `@render()` instead of `@func()`
- Don't pass stuff into @render() function, instead attach stuff to instance and accessed through `this`
  - `@el`
  - `@view`
  - `@options`
  - `@watch` (instead of `getValue()`)

### Outstanding questions

- Can Ext's have CSS associated with it like a View has?
  - x_model could style validity


NEW: cell/Model entry iteration
-------------------------------

    model.each (key, value)->
    model.map (key, value)->
    model.reduce (sum, key, value)->


NEW: defineView! @extends:SuperClass
------------------------------------

    require('defineView!').extend
      extends: require 'BaseView'
      render: (_)-> [...]


!!! Make sure element's class has both the SuperClass and SubClass


NEW: Handle access changing expressions
---------------------------------------

    render_el: (__)-> [
      __ '.mydiv', ->
        if @get 'switch' then @get 'one'
        else @get 'two'
    ]


NEW: Pipes
----------

Input and Output.
Takes a Collection input and outputs another Collection.  Can be used for any type of transformation like, but not limited to: filtering, sorting, mapping, and reducing.
It allows for *nix style pipeing of data:

    # *nix piping
    > Collection | Filter | Sort | Page

    # cell piping
    Collection.pipe Filter(), Sort(), Page()

A Pipe has 2 forms whole and incremental.

### Pipe

Just a function.

    # Simple passthrough pipe
    passthrough = (input)-> input.toArray()

### Smart Pipe

For large, high performance, and active collections.
A pipeline of Whole Pipes can be very costly calculate. And when a collection changes (add, remove), starting from scratch and executing each pipe could make it piping impractical if changes occur frequently.

Smart Pipes to the rescue.

If the input collection changes (add,remove), the first pipe is notified and can choose to operate on just the small subset that has changed.  This may or may not effect it's output.  If no changes are made to first pipe's output, then no other downstream pipe's are notified.  If there changes are made, the next pipe is notified of only the changes.

    # Simple passthrough pipe
    Passthrough = Pipe.extend

      constructor: ->
        # Smart Pipe's are Model's that store the options passed in on instantiation
        # You can listen to changes to these options and change the output as necessary
        # Ex. Filtering of list changes based on user input
        @on 'any', ->

      onReset: -> @output.reset @input

      onAdd: (item, index)-> @output.add item, index

      onRemove: (item, index)-> @output.remove index

    # Smart Pipes can be passed an options hash
    inputCollection.pipe passthrough = Passthrough option1:'value 1'

    # Change a pipe's options
    passthrough.set 'option1', 'value 2'


BUG: __.if() and __.each() need to call with view as `this`
-----------------------------------------------------------

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

