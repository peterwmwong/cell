define [
  'cell/Ext'
  'cell/View'
], (Ext, View)->

  orig__ = View::__
  View::__ = (viewOrSelector, rest...)->
    exts = []
    args = [viewOrSelector]

    if rest.length
      for cur,i in rest
        break unless cur instanceof Ext
        exts.push cur
      args = args.concat rest.slice i

    el = orig__.apply @, args
    e.run el, @ for e in exts
    el

