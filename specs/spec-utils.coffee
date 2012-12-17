define (require)->
  _ = require 'underscore'

  exports =
    stringify: (obj, excludeArrayBrackets)->
      if obj is undefined
        "undefined"

      else if obj is null
        "null"

      else if obj.jquery? or _.isArray obj
        str = _.map(obj,exports.stringify).join ', '
        if excludeArrayBrackets 
          str
        else
          "[#{str}]"

      else if _.isElement obj
        "<#{obj.tagName.toLowerCase()}/>"

      else if _.isObject obj
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
          list = _.filter node.attributes, ({name})-> name isnt 'cellcid'

          # Sort attributes as order is not guaranteed to be the
          # same on each browser
          list.sort (a,b)->
            if a.name is b.name then 0
            else if a.name < b.name then -1
            else 1

          _.each list, (el)-> html += " #{el.name}=\"#{el.value}\""

        html += ">"

        # Recursively html-ize children
        _.each $(node).contents(), (el)-> html += nodeToHTML el
          
        html += "</#{node.tagName.toLowerCase()}>"

      else
        $(node).text()
