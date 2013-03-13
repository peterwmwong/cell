define ->
  hashuid = 0
  (obj)->
    if ((objType = typeof obj) is 'object') and obj isnt null
      obj.$$hashkey or= ""+(++hashuid)
    else
      objType + ':' + obj
