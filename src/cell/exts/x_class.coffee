define [
  'cell/Ext'
  'dom/class'
], (Ext,cls)->

  Ext.extend (element, classHash, getValue)->
    return unless classHash and classHash.constructor is Object
    for k,v of classHash then do(k)->
      getValue v, (value)->
        (if value then cls.add else cls.remove) element, k
    return