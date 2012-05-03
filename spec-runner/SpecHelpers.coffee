define
  spyOnAll: (o)->
    for k,v of o then spyOn(o, k).andCallThrough()
    o