define [
  'util/type'
  'util/fn'
  'dom/data'
  'dom/events'
  'dom/mutate'
  'cell/Model'
  'cell/Ext'
  'cell/util/spy'
], (type, fn, data, events, mutate, Model, Ext, {watch,unwatch,suspendWatch})->

  protoProp = 'prototype'
  noop = ->
  d = document

  View = Model.extend
    constructor: (options)->
      t = @
      t.options =
        if options
          t.model = options.model
          t.collection = options.collection
          delete options.model
          delete options.collection
          options
        else {}

      t.__ = fn.b View[protoProp].__, t

      t.beforeRender()
      t.el = el = t.renderEl t.__
      cellName = t._cellName
      el.className = if (cls = el.className) then (cls+' '+cellName) else cellName
      data.set el, 'cellRef', t
      el.setAttribute 'cell', cellName
      t._rcs (t.render t.__), el
      t.afterRender()
      return

    beforeRender: noop
    renderEl: -> d.createElement 'div'
    render: noop
    afterRender: noop

    watch: (expr,callback)->
      watch @, expr, callback
      return

    __: (viewOrHAML, optionsOrFirstChild)->
      children = [].slice.call arguments, 1
      i = 0
      len = children.length
      while i < len
        break unless children[i++] instanceof Ext

      exts = children.splice 0, i
      options =
        if children.length and children[0] and children[0].constructor is Object
          children.shift()
        else
          {}

      # HAML
      if type.isS viewOrHAML
        if m = /^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(viewOrHAML)
          # Tag
          parent = d.createElement m[1] or 'div'

          # id
          if m[3]
            parent.setAttribute 'id', m[3]

          # class
          if m[4]
            classes = m[4].slice(1).replace(/\./g, ' ')
            options.class =
              if options.class then classes + " #{options.class}"
              else classes

          for k,v of options
            if match = /^on(\w+)/.exec k
              events.on parent, match[1], v, @
            else
              watch @, v, do(k)-> (value)->
                if k is 'innerHTML'
                  parent.innerHTML = value
                else
                  parent.setAttribute k, value
                return
            
      # View
      else if viewOrHAML and viewOrHAML[protoProp] instanceof View
        suspendWatch ->
          parent = new viewOrHAML(options).el

      if parent
        @_rcs children, parent
        i = exts.length
        while i--
          exts[i].run parent, @
        parent


    destroy: ->
      if @el
        Model[protoProp].destroy.call @
        unwatch @
        mutate.remove @el
        delete @el
      return

    _rc: (n, parent, insertBeforeNode, rendered)->
      if type.isF n
        nodes = []
        watch @, n, (renderValue)->
          prevNodes = nodes
          renderValue = [d.createTextNode ''] unless renderValue?
          nodes = @_rcs renderValue, parent, prevNodes[0]
          renderValue=0
          while n = prevNodes[renderValue++]
            parent.removeChild n
          return

       # Is Element or Text Node
      else if n.nodeType in [1,3]
        rendered.push parent.insertBefore n, insertBeforeNode

      else iftypent, insertBeforeNode, rendered

      else
        rendered.push parent.insertBefore d.createTextNode(n), insertBeforeNode
      return

    _rcs: (nodes, parent, insertBeforeNode=null, rendered=[])->
      return rendered unless nodes?
      nodes = [nodes] unlesstyperent, insertBeforeNode, rendered) for n in nodes when n?
      rendered
