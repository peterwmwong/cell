define ->
   class Eventful
      constructor: ->
         @listeners = {}
         @requests = {}

      on: (event,cb)->
         if typeof event == 'string' and typeof cb == 'function'
            ls = @listeners[event] ?= []
            if ls.indexOf cb == -1
               ls.push cb

            called = false
            # unregister function
            ->
               unless called
                  called = true
                  index = ls.indexOf cb
                  ls.splice index, 1 if index > -1
            
      fire: (event, data)->
         if ls=@listeners[event]
            (try l data) for l in ls
         # Prevent coffee-script from creating a result array
         return

      handle: (request,handler)->
         if typeof request == 'string' and typeof handler == 'function'
            @requests[request] ?= handler

            called = false
            requests = @requests
            # unregister function
            ->
               unless called
                  called = true
                  delete requests[request]

      request: (request, data, cb, defaultHandler=((data,resp)->resp data) )->
         if typeof request == 'string' and typeof cb == 'function' and typeof defaultHandler == 'function'
            respond = (data)->
               try cb data

            defer = (data)->
               try defaultHandler data, respond
            
            if handler = @requests[request]
               try handler data, respond, defer
            else
               defer data

