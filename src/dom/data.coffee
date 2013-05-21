define ->
  nextId = 1
  domCache = {}
  domExpandoAttr = "dom-#{new Date().getTime()}"

  get: (element, key)->
    noKey = not key?
    if expandoId = element[domExpandoAttr]
      expandoStore = domCache[expandoId]
    else if noKey
      domCache[element[domExpandoAttr] = nextId++] = expandoStore = {}

    if expandoStore
      if noKey
        expandoStore
      else
        expandoStore[key]

  set: (element, key, value)->
    if expandoId = element[domExpandoAttr]
      domCache[expandoId][key] = value
    else
      domCache[element[domExpandoAttr] = nextId++] = result = {}
      result[key] = value
    return

  remove: (element, key)->
    if (expandoId = element[domExpandoAttr]) and (expandoStore = domCache[expandoId])
      if key?
        delete expandoStore[key]
      else
        delete domCache[expandoId]

        # Reuse key variable
        if (key = expandoStore.cellRef) and key.destroy
          try key.destroy()

        # Reuse key variable
        if (key = expandoStore.handle) and key.destroy
          try key.destroy()

        # ie does not allow deletion of attributes on elements.
        element[domExpandoAttr] = undefined

    return
