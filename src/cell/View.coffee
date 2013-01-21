define [
  'underscore'
  'backbone'
  'jquery'
], (_, Backbone, $)->

  isArrayish = (o)-> (_.isArray o) or o.jquery

  # Maps cid to cell
  cidMap = {}

  # Override jQuery.cleanData()
  # This method is called whenever a DOM node is removed using $.fn.remove(),
  # $.fn.empty(), or $.fn.html().  If the DOM node being removed is a cell's
  # @el, lookup the cell and call @dispose()
  origCleanData = $.cleanData
  $.cleanData = ( elems, acceptData )->
    i=0
    while elem = elems[i++]
      origCleanData [elem], acceptData
      if cid = elem.cellcid
        cell = cidMap[cid]
        cell.$el = undefined
        cell.remove()
    return

  __ = (viewOrHAML, optionsOrFirstChild)->
    children =
      [].slice.call arguments,
        if optionsOrFirstChild and optionsOrFirstChild.constructor is Object
          options = optionsOrFirstChild
          2
        else
          1

    # HAML
    if typeof viewOrHAML is 'string'
      if m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(viewOrHAML)
        # Tag
        parent = document.createElement m[1] or 'div'

        # id
        if m[3]
          parent.setAttribute 'id', m[3]

        # class
        if m[4]
          parent.className = m[4].slice(1).replace(/\./g, ' ')

        @_renderAttr(k,v,parent) for k,v of options
          
    # Cell
    else if viewOrHAML and viewOrHAML.prototype instanceof Backbone.View
      parent = (new viewOrHAML options).render().el

    if parent
      @_renderChildren children, parent
      parent

  __.if = (condition,thenElse)->
    thenElse[if condition then 'then' else 'else']?()

  __.each = (col,renderer)->
    if col instanceof Backbone.Collection
      col.map renderer
    else
      renderer item, i, col for item,i in col


  View = Backbone.View.extend

    _constructor: ->
      @__ = _.bind @__, @
      @__.if = View::__.if
      @__.each = View::__.each
      return

    constructor: ->
      Backbone.View.apply @, arguments
      @_constructor()
      return

    _renderAttr: (k,v,parent)->
      parent.setAttribute k, v

    _renderChild: (n, parent, insertBeforeNode, rendered)->
       # Is Element or Text Node
      if n.nodeType in [1,3]
        rendered.push parent.insertBefore n, insertBeforeNode

      else if isArrayish n
        @_renderChildren n, parent, insertBeforeNode, rendered

      else
        rendered.push parent.insertBefore document.createTextNode(n), insertBeforeNode
      return

    _renderChildren: (nodes, parent, insertBeforeNode=null, rendered=[])->
      return rendered unless nodes?
      nodes = [nodes] unless isArrayish nodes
      @_renderChild(n, parent, insertBeforeNode, rendered) for n in nodes when n?
      rendered

    __: __

    render: ->
      @_renderChildren (@renderEl @__), @el
      @afterRender()
      @

    # Removes anything that might leak memory
    remove: ->
      delete cidMap[@cid]
      @el.cellcid = undefined
      @$el.remove() if @$el
      @stopListening()
      @model = @collection = @el = @$el = @$ = undefined
      return

    _setElement: Backbone.View::setElement
    setElement: (element, delegate)->
      @_setElement element, delegate

      # Track the cell instance by cid
      cidMap[@cid] = this
      @el.setAttribute 'cell', @_cellName

      # Used jQuery.cleanData() to retrieve the cell instance
      # associated with a DOM Element
      @el.cellcid = @cid
      @

    renderEl: ->
    afterRender: ->
  