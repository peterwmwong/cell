define [
  'util/hash'
  'util/type'
  'cell/util/spy'
  'cell/View'
  'cell/Ext'
], (hash, {isF:isExpr}, {watch}, View, Ext)->

  bind = (f,o)-> -> f.call o

  Ext::getValue = (v,callback)->
    if isExpr v
      watch (bind v, @view), (value)=>
        callback.call @, value
        return
    else
      callback.call @, v
    return

  render = (parent, view, renderValue, prevNodes)->
    renderValue = [document.createTextNode ''] unless renderValue?
    newNodes = view._renderChildren renderValue, parent, prevNodes[0]
    i=-1
    len=prevNodes.length
    parent.removeChild prevNodes[i] while ++i<len
    newNodes

  Bind = (view, expr)->
    @r = (parent)->
      nodes = []
      watch (bind expr, view), (renderValue)->
        nodes = render parent,
          view
          renderValue
          nodes
        return
      return
    return

  IfBind = (view, cond, thnElse)->
    @r = (parent)->
      nodes = []
      watch (bind cond, view), (condValue)->
        nodes = render parent,
          view
          if condValue then thnElse.then?() else thnElse.else?()
          nodes
        return
      return
    return

  HashQueue = ->
    @h = {}
    return

  HashQueue:: =
    push: (key,val)->
      entry = (@h[key] or= [])
      entry.push val
      return
    shift: (key)->
      if entry = @h[key]
        if entry.lengh is 1
          delete @h[key]
          entry[0]
        else
          entry.shift()

  EachBind = (view, expr, itemRenderer)->
    itemhash = new HashQueue
    @r = (parent)->
      watch (bind expr, view), (value)->
        newEls = []
        newItemHash = new HashQueue

        i=-1
        len=value.length
        while ++i<len
          unless prevItemEl = (itemhash.shift key = (hash item = value[i]))
            prevItemEl = itemRenderer item
          
          newItemHash.push key, prevItemEl
          newEls.push prevItemEl

        # Remove the elements for the itmes that were removed from the collection
        for key, items of itemhash.h
          i=-1
          len=items.length
          while ++i<len
            parent.removeChild items[i]
        itemhash = newItemHash

        # Add the elements for the current items
        i=-1
        len=newEls.length
        while ++i<len
          parent.appendChild newEls[i]
        return
      return
    return

  EachBind::constructor = IfBind::constructor = Bind

  __ = View::__
  orig__if = __.if
  __.if = (condition,thenElse)->
    if isExpr condition
      new IfBind @view, condition, thenElse
    else
      orig__if.call @, condition, thenElse

  orig__each = __.each
  __.each = (col,renderer)->
    if isExpr col
      new EachBind @view, col, renderer
    else
      orig__each.call @, col, renderer

  orig_renderAttr = View::_renderAttr
  View::_renderAttr = (k, v, parent)->
    if isExpr v
      watch (bind v, @), (value)->
        parent.setAttribute k, value
        return
    else
      orig_renderAttr k, v, parent
    return

  orig_renderChild = View::_renderChild
  View::_renderChild = (n, parent, insertBeforeNode, rendered)->
    n = new Bind @, n if isExpr n

    if n.constructor is Bind
      n.r parent

    else
      orig_renderChild.call @, n, parent, insertBeforeNode, rendered

    return
