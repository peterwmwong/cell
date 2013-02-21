define ->
  hashuid = 0
  (obj)->
    (objType = typeof obj) + ':' +
      if (objType is 'object') and (obj isnt null)
        obj.$$hashkey or= (++hashuid).toString 36
      else
        obj