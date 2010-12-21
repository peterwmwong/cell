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

            # unregister function
            (->
               called = false
               return ->
                  unless called
                     called = true
                     index = ls.indexOf cb
                     ls.splice index, 1 if index > -1
            )()
            
      fire: (event, data)->
         (@listeners[event] ? []).forEach (l)->
            try l data

      handle: (request,handler)->
         if typeof request == 'string' and typeof handler == 'function'
            @requests[request] ?= handler

            # unregister function
            (=>
               called = false
               return =>
                  unless called
                     called = true
                     delete @requests[request]
            )()

      request: (request, data, cb, defaultHandler=(data,resp)->resp(data))->
         if typeof request == 'string' and typeof cb == 'function' and typeof defaultHandler == 'function'
            respond = (data)->
               try cb data

            defer = (data)->
               try defaultHandler data, respond
            
            handler = @requests[request]
            if handler
               try handler data, respond, defer
            else
               defer data

