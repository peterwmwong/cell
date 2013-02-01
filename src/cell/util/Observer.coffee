define [
  'util/hash'
  'cell/Model'
  'cell/Collection'
], (hash, Model, Collection)->

  onChange = ->
    try @cb @expr()
    return

  watch: (expr, cb)->
    Model._spy.start()
    # TODO
    # Collection._spy.start()

    try value = expr()

    accesslog = Model._spy.stop()

    # TODO
    # collectionCalls = Model._spy.stop()
    # hashCollections = {}
    # for c in collectionCalls
    #   hashCollections[hashkey c.collection] = [
    #     c.collection
    #     [
    #       'add'
    #       'remove'
    #       'sort'
    #       'filter'
    #     ]
    #   ]

    for modelHashKey, m of accesslog
      for p of m.props
        m.model.on "change:#{p}", onChange, {expr,cb}

    cb value

    return