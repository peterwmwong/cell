define ['jquery'], ($)->

  indexOf =
    if Array.prototype.indexOf
      (arr,el)-> arr.indexOf(el)
    else
      (arr,el)->
        i=0
        while i<arr.length
          if arr[i] is el
            return i;
          else
            ++i
        -1

  msie = Number((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) or [])[1])
  lowercase = (s)-> s.toLowerCase()
  uppercase = (s)-> s.toUpperCase()

  nodeName_ =
    if(msie < 9)
      (element)->
        element = if element.nodeName then element else element[0]
        if element.scopeName and element.scopeName isnt 'HTML'
          uppercase(element.scopeName + ':' + element.nodeName)
        else
          element.nodeName
    else
      (element)->
        if element.nodeName then element.nodeName else element[0].nodeName

  exports =
    waitOne: (expectCallback)->
      done = false
      runs -> setTimeout (-> done = true), 1
      waitsFor -> done
      runs expectCallback

    browserTrigger: (element, type, keys)->
      element = element[0] if element and not element.nodeName
      return unless element

      unless type
        type = {
          'text': 'change'
          'textarea': 'change'
          'hidden': 'change'
          'password': 'change'
          'button': 'click'
          'submit': 'click'
          'reset': 'click'
          'image': 'click'
          'checkbox': 'click'
          'radio': 'click'
          'select-one': 'change'
          'select-multiple': 'change'
        }[lowercase element.type] or 'click'

      if lowercase(nodeName_ element) is 'option'
        element.parentNode.value = element.value
        element = element.parentNode
        type = 'change'

      keys or= []

      pressed = (key)-> indexOf(keys, key) isnt -1

      if msie < 9
        if element.type in ['radio','checkbox']
          element.checked = not element.checked
        
        # WTF!!! Error: Unspecified error.
        # Don't know why, but some elements when detached seem to be in inconsistent state and
        # calling .fireEvent() on them will result in very unhelpful error (Error: Unspecified error)
        # forcing the browser to compute the element position (by reading its CSS)
        # puts the element in consistent state.
        element.style.posLeft

        # TODO(vojta): create event objects with pressed keys to get it working on IE<9
        ret = element.fireEvent "on#{type}"
        if lowercase(element.type) is 'submit'
          while element
            if lowercase(element.nodeName) is 'form'
              element.fireEvent 'onsubmit'
              break
            element = element.parentNode

        ret

      else
        evnt = document.createEvent 'MouseEvents'
        originalPreventDefault = evnt.preventDefault
        fakeProcessDefault = true
        finalProcessDefault = undefined

        evnt.preventDefault = ->
          fakeProcessDefault = false
          originalPreventDefault.apply evnt, arguments

        evnt.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0, pressed('ctrl'), pressed('alt'), pressed('shift'), pressed('meta'), 0, element)

        element.dispatchEvent evnt
        finalProcessDefault = fakeProcessDefault
        finalProcessDefault

    stringify: (obj, excludeArrayBrackets)->
      if obj is undefined
        "undefined"

      else if obj is null
        "null"

      else if obj.jquery? or obj instanceof Array
        str = (for o in obj then exports.stringify o).join ', '
        # str = _.map(obj,exports.stringify).join ', '
        if excludeArrayBrackets 
          str
        else
          "[#{str}]"

      else if obj.nodeType is 1
        "<#{obj.tagName.toLowerCase()}/>"

      else if obj?.constructor is Object
        "{#{("#{k}:#{exports.stringify v}" for k,v of obj).join ','}}"
        
      else
        JSON.stringify obj

    node: (tag)-> document.createElement tag

    nodeHTMLEquals: nodeHTMLEquals = (node, expectedHTML)->
      expect(node instanceof HTMLElement).toBe true
      expect(nodeToHTML(node)).toBe expectedHTML

    nodeToHTML: nodeToHTML = (node)->

      if node.tagName
        html = "<#{node.tagName.toLowerCase()}"

        # Stringify attributes
        if node.attributes.length > 0

          # Omit the @cellCid attribute as it is generated
          list = (for attr in node.attributes when attr.name isnt 'cellcid' then attr)

          # Sort attributes as order is not guaranteed to be the
          # same on each browser
          list.sort (a,b)->
            if a.name is b.name then 0
            else if a.name < b.name then -1
            else 1

          for el in list
            html += " #{el.name}=\"#{el.value}\""

        html += ">"

        # Recursively html-ize children
        for el in $(node).contents()
          html += nodeToHTML el
          
        html += "</#{node.tagName.toLowerCase()}>"

      else
        $(node).text()
