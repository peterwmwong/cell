define ->
   defer = (func) -> setTimeout func, 1000

   $testObj: 'cell/Eventful'

   "on(event,function): listener called when event fired": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         cbSpy = sinon.spy()

         e.on 'testEvent', cbSpy

         ok not cbSpy.called, "listener shouldn't be called if event hasn't fired"
         
         testEventData = {}
         e.fire 'testEvent', testEventData

         ok cbSpy.calledOnce and cbSpy.calledWithExactly(testEventData), "listener called once and passed event data"

         done()

   "on(event,function): multiple listeners called when event fired": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         cbSpies = [sinon.spy(),sinon.spy(),sinon.spy()]

         for cb in cbSpies
            e.on 'testEvent', cb

         for cb in cbSpies
            ok not cb.called, "listener shouldn't be called if event hasn't fired"
         
         testEventData = {}
         e.fire 'testEvent', testEventData

         for cb in cbSpies
            ok cb.calledOnce and cb.calledWithExactly(testEventData), "listener called once and passed event data"
 
         done()
 
   "on(event,function): returns function to unregister listener": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         cbSpy = sinon.spy()

         unregister = e.on 'testEvent', cbSpy

         ok not cbSpy.called, "listener shouldn't be called if event hasn't fired"
         
         testEventData = {}
         e.fire 'testEvent', testEventData

         ok cbSpy.calledOnce and cbSpy.calledWithExactly(testEventData), "listener called once and passed event data"

         unregister()

         testEventData2 = {}
         e.fire 'testEvent', testEventData2
         ok cbSpy.calledOnce, "listener should not be called after being unregistered"

         done()
 

   "on(event,function): listener that throws an error does NOT prevent other listeners from being called": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         cbSpies = [sinon.spy(-> throw new Error),sinon.spy(),sinon.spy()]

         for cb in cbSpies
            e.on 'testEvent', cb

         for cb in cbSpies
            ok not cb.called, "listener shouldn't be called if event hasn't fired"
         
         testEventData = {}
         e.fire 'testEvent', testEventData

         for cb in cbSpies
            ok cb.calledOnce and cb.calledWithExactly(testEventData), "listener called once passed event data"

         done()


   "handle(event,function): returns function to unregister handler": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         handlerSpy = sinon.spy()
         cbSpy = sinon.spy()

         unregister = e.handle 'test', handlerSpy

         ok not handlerSpy.called, "handler shouldn't be called if no request"
         
         testRequestData = {}
         e.request 'test', testRequestData, cbSpy

         ok handlerSpy.calledOnce, "handler called once when request"
         
         unregister()

         testRequestData2 = {}
         e.request 'test', testRequestData2, cbSpy

         ok handlerSpy.calledOnce, "handler should not be called after being unregistered"
       
         ok cbSpy.calledOnce and cbSpy.calledWithExactly(testRequestData2), "callback called once and passed event data"

         done()


   "request(event,data,cb): handler called with request data": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         handlerSpy = sinon.spy()
         cbSpy = sinon.spy()

         e.handle 'test', handlerSpy

         ok not handlerSpy.called, "handler shouldn't be called if no request"
         
         testRequestData = {}
         e.request 'test', testRequestData, cbSpy

         ok handlerSpy.calledOnce, "handler called once when request"
         equal handlerSpy.args[0].length, 3, "handler passed 3 arguments (data, respond function, defer function)"
         [data,respond,defer] = handlerSpy.args[0]
         equal data, testRequestData, "handler arg[0] is request data"
         equal typeof respond, "function", "handler arg[1] is function (respond)"
         equal typeof defer, "function", "handler arg[1] is function (defer)"

         ok not cbSpy.called, "callback shouldn't be called if handler doesn't respond"

         done()


   "request(event,data,cb): handler can respond with modified data": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         handlerSpy = sinon.spy()
         cbSpy = sinon.spy()

         e.handle 'test', handlerSpy

         ok not cbSpy.called, "callback shouldn't be called if no request"
         ok not handlerSpy.called, "handler shouldn't be called if no request"
         
         e.request 'test', {}, cbSpy

         testRespData = {}
         handlerSpy.args[0][1] testRespData

         ok cbSpy.calledOnce and cbSpy.calledWithExactly(testRespData), "callback called once and passed response data"

         done()



   "request(event,data,cb,defaultHandler): handler can defer to default handler with modifying data": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         defaultHandlerSpy = sinon.spy()
         handlerSpy = sinon.spy()
         cbSpy = sinon.spy()

         e.handle 'test', handlerSpy

         ok not handlerSpy.called, "handler shouldn't be called if no request"
         
         e.request 'test', {}, cbSpy, defaultHandlerSpy

         modifiedRequest = {}
         handlerSpy.args[0][2] modifiedRequest

         ok not cbSpy.called, "callback shouldn't be called if default handler hasn't responded"
         
         ok defaultHandlerSpy.calledOnce, "handler called once when request"
         equal defaultHandlerSpy.args[0].length, 2, "handler passed 3 arguments (data, respond function)"
         [data,respond] = defaultHandlerSpy.args[0]
         equal data, modifiedRequest, "handler arg[0] is request data"
         equal typeof respond, "function", "handler arg[1] is function (respond)"
        
         testRespData = {}
         respond testRespData

         ok cbSpy.calledOnce and cbSpy.calledWithExactly(testRespData), "callback called once and passed response data"

         done()


   "request(event,data,cb): callback called with request data when no handlers or default handler is registered": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         cbSpy = sinon.spy()

         testRequestData = {}
         e.request 'test', testRequestData, cbSpy

         ok cbSpy.calledOnce and cbSpy.calledWithExactly(testRequestData), "callback called once and passed response data"

         done()


   "request(event,data,cb,defaultHandler): default handler called when no handler is registered": (require, get, done)->
      get (Eventful) ->
         e = new Eventful()
         handlerSpy = sinon.spy()
         cbSpy = sinon.spy()

         testRequestData = {}
         e.request 'test', testRequestData, cbSpy, handlerSpy

         ok handlerSpy.calledOnce, "handler called once when request"
         equal handlerSpy.args[0].length, 2, "handler passed 3 arguments (data, respond function)"
         [data,respond] = handlerSpy.args[0]
         equal data, testRequestData, "handler arg[0] is request data"
         equal typeof respond, "function", "handler arg[1] is function (respond)"

         ok not cbSpy.called, "callback shouldn't be called if handler doesn't respond"

         testRespData = {}
         handlerSpy.args[0][1] testRespData

         ok cbSpy.calledOnce and cbSpy.calledWithExactly(testRespData), "callback called once and passed response data"

         done()
