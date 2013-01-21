define [
  'dom/api'
], (api)->
  
  # Converts snake_case to camelCase.
  # Also there is special case for Moz prefix starting with upper case letter.
  # @param name Name to normalize
  camelCase = (name)->
    name.
      replace( /([\:\-\_]+(.))/g, (_, separator, letter, offset)->
        if offset then letter.toUpperCase() else letter
      ).
      replace(/^moz([A-Z])/, 'Moz$1')

  api.define
    get:
      if api.msie <= 8
        (e, name)->
          name = camelCase name
          val= element.currentStyle and e.currentStyle[name]
          if val is '' then 'auto;'
          val or= e.style[name]
          val if val isnt ''
      else
        (e, name)-> e.style[name]

    set: (e, name, value)->
      e.style[camelCase name] = value
