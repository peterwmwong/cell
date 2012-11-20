define (require)->
  Backbone = require 'backbone'
  $ = require 'jquery'

  # Load/render cells specified in DOM node data-cell attributes
  $ ->
    $('[data-cell]').each (i,el)->
      if cellname = @getAttribute 'data-cell'
        require ["cell!#{cellname}"], (CType)->
          el.appendChild new CType().render().el
          return
      return
    return

  # Override jquery.fn.remove
  $.fn.remove = (selector, keepData)->
    elem = undefined
    i = 0

    while (elem = @[i++])?
      if !selector or jQuery.filter( selector, [ elem ] ).length

        if !keepData and elem.nodeType == 1

          # Cell's jQuery extension
          # Triggering the 'cell-remove' event will notify the Cell
          # and any descendant Cell's to @dispose().
          $elem = $ elem
          $elem.triggerHandler 'cell-remove' if $elem.attr 'cell'
          $('[cell]', $elem).each -> $(@).triggerHandler 'cell-remove'

          jQuery.cleanData elem.getElementsByTagName "*"
          jQuery.cleanData [ elem ]

        if elem.parentNode
          elem.parentNode.removeChild elem

    return @

  pic = undefined
  exp =

    Cell: Backbone.View.extend

      setElement: (element, delegate)->
        Backbone.View::setElement.call @, element, delegate
        @$el
          .attr('cell', @name)
          .on 'cell-remove', onCellRemove = =>
            @$el.off 'cell-remove', onCellRemove
            @model?.off null, null, @
            @collection?.off null, null, @
            @undelegateEvents()
            @model = @collection = @el = @$el = @$ = undefined
        @

      render: ->
        @render_el and @el.innerHTML = @render_el()
        @after_render?()
        @

    pluginBuilder: 'cell-builder-plugin'

    load: (name, req, load, config)->
      req [name], (def)->
        throw "Couldn't load #{name} cell" unless def is Object(def)
        pic or= (exp.__preinstalledCells__ or= {})
        unless pic[name]
          pic[name] = true
          el = document.createElement 'link'
          el.href = req.toUrl "#{name}.css"
          el.rel = 'stylesheet'
          el.type = 'text/css'
          $('head').append el

        def.className = def.name = /(.*\/)?(.*)$/.exec(name)[2]

        # Normalize render_el and after_render
        def.render_el or= $.noop
        def.after_render or= $.noop

        load exp.Cell.extend def
        return
      return
