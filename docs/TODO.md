TODO
====

NEW: Collection
---------------

NEW: Targetted Bindings (The JDAM of bindings)
----------------------------------------------------

Convert open ended "unguided" bindings into smart targetted agents of changes.

### Problem

With current bindings, we don't really know what might trigger a change in it's value.
We make educated guesses when...
- View.model changes ('any' event)
- View event handlers are triggered (ex. onclick)

...but even then we have to rip through the whole list of binds, determine a change in value,
and, at the very least, do it all over again if there is a change in value (a bind can change
another bind's value). At worst we do this TEN FRIGGGIN TIMES.

We can do better.

### Solution

Binds will be smart and know exactly which Model/Collection to listen to, and even better, know exactly which property of a Model triggers a change in value.


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

