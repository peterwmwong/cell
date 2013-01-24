define [
  'dom/mutate'
  'dom/data'
  'dom/events'
], (mutate, data, events)->

  isArray = Array.isArray or (o)-> Object::toString.call(o) is "[object Array]"

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

        for k,v of options
          if match = /^on(\w+)/.exec k
            events.bind parent, match[1], v
          else
            @_renderAttr(k,v,parent)
          
    # View
    else if viewOrHAML and viewOrHAML.prototype instanceof View
      parent = new viewOrHAML(options).el

    if parent
      @_renderChildren children, parent
      parent

  __.if = (condition,thenElse)->
    thenElse[if condition then 'then' else 'else']?()

  __.each = (col,renderer)->
    renderer item, i, col for item,i in col

  View = (@options)->
    @options ?= {}
    @_constructor()
    @_render_el()
    return

  View:: =
    beforeRender: ->
    render_el: (__)-> document.createElement 'div'
    render: ->
    afterRender: ->

    __: __

    remove: ->
      mutate.remove @el
      delete @el
      return

    _constructor: ->
      __ = View::__
      @__ = => __.apply @, arguments
      @__.if = __.if
      @__.each = __.each
      return

    _render_el: ->
      @beforeRender()
      @el = @render_el @__
      @el.className = if (cls = @el.className) then (cls+' '+@_cellName) else @_cellName
      data.set @el, 'cellRef', @
      @el.setAttribute 'cell', @_cellName
      @_renderChildren (@render @__), @el
      @afterRender()

    _renderAttr: (k,v,parent)->
      parent.setAttribute k, v
      return

    _renderChild: (n, parent, insertBeforeNode, rendered)->
       # Is Element or Text Node
      if n.nodeType in [1,3]
        rendered.push parent.insertBefore n, insertBeforeNode

      else if isArray n
        @_renderChildren n, parent, insertBeforeNode, rendered

      else
        rendered.push parent.insertBefore document.createTextNode(n), insertBeforeNode
      return

    _renderChildren: (nodes, parent, insertBeforeNode=null, rendered=[])->
      return rendered unless nodes?
      nodes = [nodes] unless isArray nodes
      @_renderChild(n, parent, insertBeforeNode, rendered) for n in nodes when n?
      rendered

  View.extend = (proto)->
    SuperView = this

    NewView = (options)->
      SuperView.call @, options
      return
    NewView.extend = SuperView.extend

    Surrogate = ->
    Surrogate:: = SuperView::
    NewView:: = new Surrogate()
    if proto
      NewView::[k] = v for k,v of proto
    NewView

  View
  