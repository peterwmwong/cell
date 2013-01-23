define ->

  msie: Number((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) or [])[1])
  define: (o)->
    (e, nameOrHash, value)->
      # set
      if arguments.length is 3
        o.set e, nameOrHash, value

      else if nameOrHash

        # set all
        if nameOrHash.constructor is Object
          for name, value of nameOrHash
            o.set e, name, value

        # get all
        else if nameOrHash instanceof Array
          result = {}
          for name in nameOrHash
            result[name] = o.get e, name
          result

        # get
        else
          o.get e, nameOrHash
