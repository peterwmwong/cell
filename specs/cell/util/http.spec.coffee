define [
  '../../utils/spec-utils'
  'sinon-server'
], ({waitOne},sinon)->

  ({beforeEachRequire})->

    beforeEach ->
      @xhr = sinon.useFakeXMLHttpRequest()
      @requests = []
      @xhr.onCreate = (xhr)=> @requests.push xhr

      @callback = jasmine.createSpy 'callback'

    beforeEachRequire ['cell/util/http'], (@http)->

    afterEach ->
      @xhr.restore()

    describe 'http( { method:string, url:string, data:string, headers:object, timeout:number, withCredentials:boolean, responseType:string }, callback:function )', ->

      describe 'http protocol', ->
        it "should do basics - open async xhr and send data", ->
          @http method: "GET", url:"/some-url", data:'yolo'->
          request = @requests[0]
          expect(request.method).toBe "GET"
          expect(request.url).toBe "/some-url"
          expect(request.data).toBe "yolo"
          expect(request.async).toBe true

        it "should normalize IE's 1223 status code into 204", ->
          @callback.andCallFake (status)->
            expect(status).toBe 204

          @http method: "GET", url: "URL", @callback

          request = @requests[0]
          request.respond 1223

          expect(@callback.callCount).toBe 1

        it "should set only the requested headers", ->
          @http
            method: "POST"
            url: "URL"
            headers:
              "X-header1": "value1"
              "X-header2": "value2"
            (->)

          request = @requests[0]
          expect(request.requestHeaders["X-header1"]).toBe "value1"
          expect(request.requestHeaders["X-header2"]).toBe "value2"

        it "should abort request on timeout", ->
          @callback.andCallFake (status, response)=>
            expect(status).toBe -1
            expect(request.aborted).toBe true

          @http method: "GET", url: "URL", timeout: 1000, @callback

          request = @requests[0]

          done = false
          runs -> setTimeout (->done=true), 1000
          waitsFor -> done
          runs -> expect(@callback.callCount).toBe 1

        it "should register onreadystatechange callback before sending", ->
          
          # send() in IE6, IE7 is sync when serving from cache
          SyncXhr = ->
            xhr = this
            @open = @setRequestHeader = ->
            @send = ->
              @status = 200
              @responseText = "response"
              @readyState = 4
              @onreadystatechange()

            @getAllResponseHeaders =  -> ""
            
            # for temporary Firefox CORS workaround
            # see https://github.com/angular/angular.js/issues/1468
            @getResponseHeader =  -> ""
            return

          @callback.andCallFake (status, response) ->
            expect(status).toBe 200
            expect(response).toBe "response"

          @http.XHR = SyncXhr
          @http method:"GET", url:"/url", @callback
          expect(@callback.callCount).toBe 1

        it "should set withCredentials", ->
          @http method: "GET", url: "/some.url", withCredentials: true, @callback
          expect(@requests[0].withCredentials).toBe true

        it "should set responseType and return xhr.response", ->
          request = undefined
          @http.XHR = ->
            request = @
            @open = @setRequestHeader = ->
            @send = ->
              @status = 200
              @responseType = request.responseType
              @response = some: "object"
              @readyState = 4
              @onreadystatechange()

            @getAllResponseHeaders =  -> ""
            
            # for temporary Firefox CORS workaround
            # see https://github.com/angular/angular.js/issues/1468
            @getResponseHeader =  -> ""
            return

          @callback.andCallFake (status, response) ->
            expect(response).toEqual some: "object"

          @http method: "GET", url: "/some.url", responseType:'blob', @callback

          expect(request.responseType).toBe 'blob'
          expect(@callback.callCount).toBe 1
      
      # TODO(vojta): test whether it fires "async-start"
      # TODO(vojta): test whether it fires "async-end" on both success and error
      describe "file protocol", ->

        it "should convert 0 to 200 if content", ->
          @http method:"GET", url:"file:///whatever/index.html", @callback
          @requests[0].respond 0, {}, "SOME CONTENT"

          expect(@callback).toHaveBeenCalled()
          expect(@callback.calls[0].args[0]).toBe 200

        it "should convert 0 to 404 if no content", ->
          @http method:"GET", url:"file:///whatever/index.html", @callback
          @requests[0].respond 0, {}, ""
          expect(@callback).toHaveBeenCalled()
          expect(@callback.calls[0].args[0]).toBe 404

