define [
  'cell/Ext'
  'dom/class'
], (Ext,{addClass,removeClass})->

  Ext.extend (element, classHash, getValue)->
    return unless classHash and classHash.constructor is Object
    for k,v of classHash then do(k)->
      getValue v, (value)->
        (if value then addClass else removeClass) element, k
    return