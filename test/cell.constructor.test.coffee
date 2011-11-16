define ->

  testHTML = do->
    div = document.createElement 'div'
    (node,expectedHTML)->
      div.innerHTML = ''
      div.appendChild node
      equal div.innerHTML, expectedHTML, 'HTML'

  isCellInstance = (instance)->
    ok (instance instanceof cell), 'instance is an instanceof cell'
    ok instance.el instanceof HTMLElement, 'instance.el is an HTMLElement'
    equal instance.el.tagName.toUpperCase(), 'DIV', 'instance.el is <div>'
    equal instance.el.innerHTML, '', 'instance.el is an empty <div>'
    ok instance.$el instanceof jQuery, 'instance.$el is jQuery object'

  'cell constructor() creates instance of cell': ->
    NewCell = cell.extend()
    instance = new NewCell()

    isCellInstance instance
    deepEqual instance.options, {}, 'instance.options is empty object (not specified in constructor)'

  'cell constructor() when cell::tag is "<p>"': ->
    NewCell = cell.extend tag: '<p>'
    testHTML new NewCell().el, "<p></p>"

  'cell constructor() when cell::tag is "<p id=\'testId\' class=\'testClass\' data-customattr=\'testAttr\'>"': ->
    NewCell = cell.extend tag: "<p id=\'testId\' class=\'testClass\' data-customattr=\'testAttr\'>"
    testHTML new NewCell().el, '<p id="testId" class="testClass" data-customattr="testAttr"></p>'

  'cell constructor({id:<string>,class:<string>}) when cell::tag is "<p id=\'testId\' class=\'testClass\' data-customattr=\'testAttr\'>"': ->
    NewCell = cell.extend
      tag: "<p id=\'testId\' class=\'testClass\' data-customattr=\'testAttr\'>"

    testHTML new NewCell(id:'overrideID', class:'extraClass extraClass2').el,
      '<p id="overrideID" class="testClass extraClass extraClass2" data-customattr="testAttr"></p>'

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

