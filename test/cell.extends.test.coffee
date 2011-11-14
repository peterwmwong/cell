define ->

  isCellInstance = (instance)->
    ok (instance instanceof cell), 'instance is an instanceof cell'
    ok instance.el instanceof HTMLElement, 'instance.el is an HTMLElement'
    equal instance.el.tagName.toUpperCase(), 'DIV', 'instance.el is <div>'
    equal instance.el.innerHTML, '', 'instance.el is an empty <div>'
    ok instance.$el instanceof jQuery, 'instance.$el is jQuery object'

  $beforeEach: ->
    @testCell = cell.extend

  'cell.extend()': ->
    ok (cell.extend().prototype instanceof cell), 'prototype is an instanceof cell'
    start()

  'cell constructor() creates instance of cell': ->
    newCell = cell.extend()
    instance = new newCell()

    isCellInstance instance
    deepEqual instance.options, {}, 'instance.options is empty object (not specified in constructor)'
    start()

  'cell constructor(options:&lt;object&gt;) creates instance of cell with options': ->
    newCell = cell.extend()
    options = {a:1,b:'2',c:(->3)} 
    instance = new newCell options

    isCellInstance instance
    deepEqual instance.options, options, 'instance.options is empty object (not specified in constructor)'
    start()

  'cell.extend({init:<function>,render:<function>})': ->
    order = 0
    callOrder = {}
    NewCell = cell.extend
      init: (-> callOrder.init = order++)

    ok (NewCell.prototype instanceof cell), 'prototype is an instanceof cell'
    ok (new NewCell() instanceof cell), 'instance is an instanceof cell'
    start()

