define
  rm: (events, fn, whichOrCtx)->
    i=-1
    isWhich = typeof whichOrCtx is 'number'
    while ev = events[++i] when (if isWhich then ev[whichOrCtx] is fn else (ev[0] is fn) and (ev[1] is whichOrCtx))
      events.splice i--, 1
    return
