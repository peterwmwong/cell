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
        if expandoStore.handle and expandoStore.handle.destroy
          expandoStore.handle.destroy()

        delete domCache[expandoId]

        # ie does not allow deletion of attributes on elements.
        element[domExpandoAttr] = undefined

    return
