define [
  './util/helpers'
], ({nodeHTMLEquals})->


  isCellInstance = (instance)->
    ok (instance instanceof cell), 'instance is an instanceof cell'
    ok instance.el instanceof HTMLElement, 'instance.el is an HTMLElement'
    strictEqual instance.el.tagName.toUpperCase(), 'DIV', 'instance.el is <div>'
    strictEqual instance.el.innerHTML, '', 'instance.el is an empty <div>'
    ok instance.$el instanceof jQuery, 'instance.$el is jQuery object'

  'constructor() creates instance of cell': ->
    NewCell = cell.extend()
    instance = new NewCell()

    isCellInstance instance
    deepEqual instance.options, {}, 'instance.options is empty object (not specified in constructor)'

  'constructor({id:<string>}) id overrides cell::tag': ->
      NewCell = cell.extend tag: "<p id=\'testId\'>"
      nodeHTMLEquals new NewCell(id:'overrideID').el, '<p id="overrideID"></p>'

  'constructor({class:<string>}) class is used IN ADDITION to classes specified by cell::tag': ->
    NewCell = cell.extend tag: "<p class=\'testClass\'>"
    nodeHTMLEquals new NewCell(class:'extraClass extraClass2').el,
      '<p class="testClass extraClass extraClass2"></p>'

  'constructor(options:<object>) creates instance of cell with options': ->
    NewCell = cell.extend()
    options = {a:1,b:'2',c:(->3)} 
    instance = new NewCell options

    isCellInstance instance
    deepEqual instance.options, options, 'instance.options the object passed into constructor'
  
  'constructor(options:<object>) calls init(), then tag(), and finally render()': ->
    NewCell = cell.extend
      init: init = sinon.spy()
      tag: tag = sinon.spy()
      render: render = sinon.spy()

    options = {a:1,b:'2',c:(->3)} 
    instance = new NewCell options

    # init()
    ok init.calledOnce, 'init() called once'
    deepEqual init.getCall(0).args, [options], 'init() was passed options'
    ok init.calledOn(instance), 'init() called with "this" set to cell instance'

    # tag()
    ok tag.calledOnce, 'tag() called once'

    # render()
    ok render.calledOnce, 'render() called once'
    ok render.getCall(0).calledWith(cell::_), 'render() was passed cell.prototype._ (cell render helper)'

    # Call Order
    ok init.calledBefore(tag), 'init() called before tag()'
    ok tag.calledBefore(render), 'tag() called before render()'
