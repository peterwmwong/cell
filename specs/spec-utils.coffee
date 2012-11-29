define (require)->
  _ = require 'underscore'

  exports =
    stringify: (obj, excludeArrayBrackets)->
      if obj is undefined
        "undefined"
      else if obj is null
        "null"
      else if obj.jquery? or _.isArray obj
        str = (exports.stringify el for el in obj).join ', '
        if excludeArrayBrackets then str else "[#{str}]"
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

          # Omit the @cell_cid attribute as it is generated
          list = (attr for attr in node.attributes when attr.name isnt 'cell_cid')

          # Sort attributes as order is not guaranteed to be the
          # same on each browser
          list.sort (a,b)->
            if a.name is b.name then 0
            else if a.name < b.name then -1
            else 1

          for {name,value} in list
            html += " #{name}=\"#{value}\""

        html += ">"

        # Recursively html-ize children
        for child in $(node).contents()
          html += nodeToHTML child
          
        html += "</#{node.tagName.toLowerCase()}>"

      else
        $(node).text()
