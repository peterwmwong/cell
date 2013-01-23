define [
  'dom/browser'
  'dom/data'
], (browser, data)->

  indexOf =
    if Array::indexOf
      (array, el)-> array.indexOf el
    else
      (array, el)->
        i=0
        return i-1 while a = array[i++] when a is el
        -1

  arrayRemove = (array, el)->
    array.splice indexOf(array, el), 1
    return

  addEventListenerFn =
    if window.document.addEventListener
      (element, type, fn)->
        element.addEventListener type, fn, false
        return 
    else
      (element, type, fn)->
        element.attachEvent "on#{type}", fn
        return

  removeEventListenerFn =
    if window.document.removeEventListener
      (element, type, fn)->
        element.removeEventListener type, fn, false
        return
    else
      (element, type, fn)->
        element.detachEvent "on#{type}", fn
        return

  createEventHandler = (element, events)->
    eventHandler = (event, type)->
      unless event.preventDefault
        event.preventDefault = ->
          event.returnValue = false #ie
          return

      unless event.stopPropagation
        event.stopPropagation = ->
          event.cancelBubble = true #ie
          return

      unless event.target
        event.target = event.srcElement or document

      unless event.defaultPrevented?
        prevent = event.preventDefault
        event.preventDefault = ->
          event.defaultPrevented = true
          prevent.call event
          return
        event.defaultPrevented = false

      event.isDefaultPrevented = ->
        return event.defaultPrevented

      if evs = events[type or event.type]
        for fn in evs
          fn.call element, event

      # Remove monkey-patched methods (IE),
      # as they would cause memory leaks in IE8.
      if browser.msie <= 8
        # IE7/8 does not allow to delete property on native object
        event.preventDefault = null
        event.stopPropagation = null
        event.isDefaultPrevented = null
      else
        # It shouldn't affect normal browsers (native methods are defined on prototype).
        delete event.preventDefault
        delete event.stopPropagation
        delete event.isDefaultPrevented
    eventHandler.elem = element
    eventHandler.destroy = -> DOMUnbindAllEvents element, events
    eventHandler

  DOMUnbindAllEvents = (element,events)->
    for type of events
      removeEventListenerFn element, type, events[type]
      delete events[type]
    return

  bind: bindFn = (element, type, fn)->
    unless events = data.get element, 'events'
      data.set element, 'events', events = {}
      
    unless handle = data.get element, 'handle'
      data.set element, 'handle', handle = createEventHandler element, events

    for type in type.split ' '
      unless eventFns = events[type]
        if type in ['mouseenter', 'mouseleave']
          counter = 0
          events.mouseenter = []
          events.mouseleave = []

          bindFn element, 'mouseover', (event)->
            counter++
            if counter is 1
              handle event, 'mouseenter'

          bindFn element, 'mouseout', (event)->
            counter--
            if counter is 0
              handle event, 'mouseleave'

        else
          addEventListenerFn element, type, handle
          events[type] = []
        eventFns = events[type]

      eventFns.push fn
    return
  
  unbind: (element, type, fn)->
    handle = data.get element, 'handle'
    events = data.get element, 'events'

    return unless handle # no listeners registered

    if type?
      if fn?
        arrayRemove events[type], fn
      else
        removeEventListenerFn element, type, events[type]
        delete events[type]
    else
      DOMUnbindAllEvents element, events

    return
