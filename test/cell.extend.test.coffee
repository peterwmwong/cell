define ->

  isCellInstance = (instance)->
    ok (instance instanceof cell), 'instance is an instanceof cell'
    ok instance.el instanceof HTMLElement, 'instance.el is an HTMLElement'
    equal instance.el.tagName.toUpperCase(), 'DIV', 'instance.el is <div>'
    equal instance.el.innerHTML, '', 'instance.el is an empty <div>'
    ok instance.$el instanceof jQuery, 'instance.$el is jQuery object'


  'cell.extend(<NOT AN OBJECT>) throws an error': ->
    for invalid in [7,"string",(->)]
      whenStr = "expected error thrown, when argument is #{invalid}"
      try
        cell.extend invalid
        ok false, whenStr
      catch e
        equal e, "cell.extend(): expects an object {render,init,name}", whenStr
    

  'cell.extend({init:<function>,render:<function>,name:String}): init, render, name are optional': ->
    for name in [undefined,null,"exampleName"]
      for init in [undefined,null,(->)]
        for render in [undefined,null,(->)]
          whenStr = "when #{JSON.stringify {init,render,name}}"

          NewCell = cell.extend {init, render, name}
          ok (NewCell.prototype instanceof cell), "prototype is an instanceof cell, #{whenStr}"
          equal NewCell::name, name, "prototype.name is the name passed in cell.extend(#{whenStr})"
          equal NewCell::init, init, "prototype.init is the init function passed in cell.extend(#{whenStr})"
          equal NewCell::render, render, "prototype.render is the render function passed in cell.extend(#{whenStr})"
          ok ((new NewCell()) instanceof cell), "instance is an instanceof newly created cell, when cell.extend(#{whenStr})"


  'cell.extend({init:<NOT A FUNCTION>, render:<NOT A FUNCTION>}), throws an error': ->
    vals = [5,"string",[],{},(->),undefined,null]
    for init in vals
      for render in vals when not ((typeof init is 'function' or init in [null,undefined]) and (typeof render is 'function' or render in [null,undefined]))
        whenStr = "expected error thrown, when typeof init == #{typeof init} and typeof render == #{typeof render}"
        try
          cell.extend {init,render}
          ok false, whenStr
        catch e
          equal e, "cell.extend(): expects {render,init} to be functions", whenStr


  'cell constructor() creates instance of cell': ->
    NewCell = cell.extend()
    instance = new NewCell()

    isCellInstance instance
    deepEqual instance.options, {}, 'instance.options is empty object (not specified in constructor)'


  'cell constructor(options:<object>) creates instance of cell with options': ->
    NewCell = cell.extend()
    options = {a:1,b:'2',c:(->3)} 
    instance = new NewCell options

    isCellInstance instance
    deepEqual instance.options, options, 'instance.options the object passed into constructor'

  
  'cell constructor(options:<object>) calls init() then render()': ->
    NewCell = cell.extend
      init: init = sinon.spy()
      render: render = sinon.spy()

    options = {a:1,b:'2',c:(->3)} 
    instance = new NewCell options
    ok init.calledOnce, 'init() called once'
    deepEqual init.getCall(0).args, [options], 'init() was passed options'

    ok render.calledOnce, 'render() called once'
    deepEqual render.getCall(0).args[0], cell::$R, 'render() was passed cell.prototype.$R (cell render helper)'
    ok (typeof render.getCall(0).args[1] is 'function'), 'render() was passed a function (asynchronous render helpser)'
