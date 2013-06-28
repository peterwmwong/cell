# The following is an example usage of a Resource.
define ->

  ({beforeEachRequire})->

    beforeEachRequire {
        'cell/util/http': http = jasmine.createSpy 'http'
      }, [
        'cell/Model'
        'cell/Resource'
        'cell/Collection'
      ], (@Model, @Resource, @Collection)->
        http.reset()
        @http = http
        @addMatchers
          toHaveBeenCalledWithCallback: (args...)->
            actualArgs = @actual.calls[0].args
            mismatchedKeys = []
            mismatchedValues = []

            for expectedArg,i in args
              unless @env.equals_ actualArgs[i], expectedArg, mismatchedKeys, mismatchedValues
                @message = ->
                  "Expected #{JSON.stringify actualArgs[i]} to equal #{JSON.stringify expectedArg}, #{mismatchedKeys}, #{mismatchedValues}"
                return false

            # Last arg should be the callback function
            return typeof actualArgs[args.length] is 'function'

    describe 'new Resource( {url:string, params?:object, transform?:function, model?:Model, collection?:Collection} )', ->

      describe 'When a model is specified', ->
        beforeEach ->
          @MyModel = @Model.extend()
          @res = new @Resource url: '/yolo/{id}', transform: @transform, model: @MyModel

        describe 'Extends, instantiates, and returns specified model on...', ->

          it '@get()', ->
            @res_inst = @res.get id: 'blah'
            expect(@res_inst instanceof @MyModel).toBe true
            expect(@res_inst instanceof @Model).toBe true

          it '@create()', ->
            @res_inst = @res.create id: 'blah'
            expect(@res_inst instanceof @MyModel).toBe true
            expect(@res_inst instanceof @Model).toBe true            

      describe 'When a collection is specified', ->
        beforeEach ->
          @MyCollection = @Collection.extend()
          @res = new @Resource url: '/yolo/{id}', transform: @transform, collection: @MyCollection
          @res_inst = @res.query id: 'blah'

        it 'Extends, instantiates, and returns specified model on @query()', ->
          expect(@res_inst instanceof @MyCollection).toBe true
          expect(@res_inst instanceof @Collection).toBe true

      describe 'When a transform function is specified', ->
        beforeEach ->
          @transform = jasmine.createSpy('transform').andCallFake (jsonObj)-> b: 777

        describe 'called upon @get() response', ->
          beforeEach ->
            @res = new @Resource url: '/yolo/{id}', transform: @transform
            @res_inst = @res.get id: 'blah'

            # http callback
            @http.calls[0].args[1] 200,
              JSON.stringify
                one: 1
                two: 'deux'
                three: 'san'
              true

          it 'calls transform()', ->
            expect(@transform).toHaveBeenCalledWith
              one: 1
              two: 'deux'
              three: 'san'

          it 'assigns data returned from transform', ->
            expect(@res_inst.attributes()).toEqual b: 777

        describe 'called upon @query() response', ->
          beforeEach ->
            @res = new @Resource url: '/yolo/{id}', transform: @transform
            @res_col = @res.query id: 'blah'

            # http callback
            @http.calls[0].args[1] 200,
              JSON.stringify [
                {one: 1}
                {two: 'deux'}
                {three: 'san'}
              ]
              true

          it 'calls transform', ->
            expect(@transform).toHaveBeenCalledWith one: 1
            expect(@transform).toHaveBeenCalledWith two: 'deux'
            expect(@transform).toHaveBeenCalledWith three: 'san'


          it 'assigns data returned from transform', ->
            @res_col.map (obj)->
              expect(obj.attributes()).toEqual b: 777

        describe 'called upon @$save() response', ->

          beforeEach ->
            @res = new @Resource url: '/yolo/{id}', transform: @transform
            @res_inst = @res.create()
            @res_inst.$save()

            # http callback
            @http.calls[0].args[1] 200,
              JSON.stringify
                one: 1
                two: 'deux'
                three: 'san'
              true

          it 'calls transform', ->
            expect(@transform).toHaveBeenCalledWith
              one: 1
              two: 'deux'
              three: 'san'

          it 'assigns data returned from transform', ->
            expect(@res_inst.attributes()).toEqual b: 777


      beforeEach ->
        @resource = new @Resource
          url: '/{defaultPathParam}/{pathParam}'
          params:
            defaultPathParam:'default'

      describe '@genUrl( params:object ) : String', ->

        describeGenUrl = (urlWithParams, inputParams, outputUrl)->
          inputParamsDisableQueryParams = {}
          for k of inputParams
            inputParamsDisableQueryParams[k] = inputParams[k]

          it "When url is '#{urlWithParams}', resource.genUrl( #{JSON.stringify inputParams}, false ) === '#{outputUrl}'", ->
            resource = new @Resource url: urlWithParams
            expect(resource.genUrl inputParams ).toBe outputUrl

        params = -> one: 1, two2: 'deux', thr_ee: '{san}'
        describeGenUrl '/x', params(), '/x?one=1&two2=deux&thr_ee=%7Bsan%7D', '/x'
        describeGenUrl '/x/{one}', params(), '/x/1?two2=deux&thr_ee=%7Bsan%7D', '/x/1'
        describeGenUrl '/x/{thr_ee}', params(), '/x/%7Bsan%7D?one=1&two2=deux', '/x/%7Bsan%7D'
        describeGenUrl '/x/{one}/{two2}/{thr_ee}', params(), '/x/1/deux/%7Bsan%7D', '/x/1/deux/%7Bsan%7D'

      describe '@create( attributes:object ) : Model', ->
        beforeEach ->
          @resourceItem = @resource.create
            one: 1
            two: 'duex'
            three: 'san'
          @resourceItem.on 'status', @statusHandler = jasmine.createSpy 'status'

        it 'should NOT issue a HTTP request', ->
          expect(@http).not.toHaveBeenCalled()

        it 'creates an empty Resource.Instance (Model)', ->
          expect(@resourceItem instanceof @Model).toBe true
          expect(@resourceItem.attributes()).toEqual
            one: 1
            two: 'duex'
            three: 'san'

        describe 'when $save() is called', ->
          beforeEach ->
            @resourceItem.$save pathParam:'pathParam', queryParam:'queryValue'

          it 'issues a HTTP request', ->
            expect(@http).toHaveBeenCalledWithCallback
              method: 'POST'
              url: '/default/pathParam?queryParam=queryValue'
              headers:
                'Content-Type': 'application/json'
              data:
                JSON.stringify
                  one: 1
                  two: 'duex'
                  three: 'san'

          it 'sets status() to "saving"', ->
            expect(@resourceItem.status()).toBe 'saving'

          describe 'when http error occurs', ->
            beforeEach ->
              @statusHandler.reset()
              # http callback
              @http.calls[0].args[1] 404, undefined, false

            it 'sets status() to "error"', ->
              expect(@resourceItem.status()).toBe 'error'

          describe 'when http responds successfully', ->
            beforeEach ->
              @statusHandler.reset()

              # http callback
              @http.calls[0].args[1] 200,
                JSON.stringify
                  one: 1
                  two: 'deux'
                  three: 'san'
                true

            it 'sets status() to "ok"', ->
              expect(@resourceItem.status()).toBe 'ok'

        describe 'when $delete() is called', ->
          beforeEach ->
            @resourceItem.$delete pathParam:'pathParam', queryParam:'queryValue'

          it "does NOT issue a HTTP request (because it's new)", ->
            expect(@http).not.toHaveBeenCalled()

      describe '@get( params:object ) : Model', ->

        beforeEach ->
          @resourceItem = @resource.get pathParam:'path', queryParam:'queryValue'
          @resourceItem.on 'status', @statusHandler = jasmine.createSpy 'status'

        it 'issues a HTTP request', ->
          expect(@http).toHaveBeenCalledWithCallback
            method: 'GET'
            url: '/default/path?queryParam=queryValue'

        it 'creates an empty Model', ->
          expect(@resourceItem instanceof @Model).toBe true
          expect(@resourceItem.attributes()).toEqual {}

        it 'sets status() to "loading"', ->
          expect(@resourceItem.status()).toBe 'loading'

        describe 'when http error occurs', ->
          beforeEach ->
            # http callback
            @http.calls[0].args[1] 404, undefined, false

          it 'sets status() to "error"', ->
            expect(@resourceItem.status()).toBe 'error'

        describe 'when http responds successfully', ->

          beforeEach ->
            @statusHandler.reset()
            # http callback
            @http.calls[0].args[1] 200,
              JSON.stringify
                one: 1
                two: 'deux'
                three: 'san'
              true

          it 'assigns all properties', ->
            expect(@resourceItem.attributes()).toEqual
              one: 1
              two: 'deux'
              three: 'san'

          it 'sets status() to "ok"', ->
            expect(@resourceItem.status()).toBe 'ok'

          describe 'when $save() is called', ->
            beforeEach ->
              @http.reset()
              @resourceItem.set 'one', 'yi'
              @resourceItem.$save pathParam:'pathParam', queryParam:'queryValue'

            it 'issues a HTTP PUT request', ->
              expect(@http).toHaveBeenCalledWithCallback
                method: 'PUT'
                url: '/default/pathParam?queryParam=queryValue'
                headers:
                  'Content-Type': 'application/json'
                data:
                  JSON.stringify
                    one: 'yi'
                    two: 'deux'
                    three: 'san'

          describe 'when $delete() is called', ->
            beforeEach ->
              @statusHandler.reset()
              @http.reset()
              @resourceItem.$delete pathParam:'pathParam', queryParam:'queryValue'

            it 'issues a HTTP PUT request', ->
              expect(@http).toHaveBeenCalledWithCallback
                method: 'DELETE'
                url: '/default/pathParam?queryParam=queryValue'

            it 'sets status() to "deleting"', ->
              expect(@resourceItem.status()).toBe 'deleting'

            describe 'when http error occurs', ->
              beforeEach ->
                @statusHandler.reset()

                # http callback
                @http.calls[0].args[1] 404, undefined, false

              it 'sets status() to "error"', ->
                expect(@resourceItem.status()).toBe 'error'

            describe 'when http responds successfully', ->
              beforeEach ->
                @statusHandler.reset()

                # http callback
                @http.calls[0].args[1] 200, {}, true

              it 'sets status() to "deleted"', ->
                expect(@resourceItem.status()).toBe 'deleted'

      describe '@query( params:object ) : ResourceCollectionInstance', ->

        beforeEach ->
          @resourceItem = @resource.query pathParam:'path', queryParam:'queryValue'
          @resourceItem.on 'status', @statusHandler = jasmine.createSpy 'status'

        it 'issues a HTTP request', ->
          expect(@http).toHaveBeenCalledWithCallback
            method: 'GET'
            url: '/default/path?queryParam=queryValue'

        it 'creates an empty Resource.CollectionInstance (Model)', ->
          expect(@resourceItem instanceof @Collection).toBe true
          expect(@resourceItem.length()).toBe 0

        it 'sets status() to "loading"', ->
          expect(@resourceItem.status()).toBe 'loading'

        describe 'when http error occurs', ->
          beforeEach ->
            @statusHandler.reset()

            # http callback
            @http.calls[0].args[1] 404, undefined, false

          it 'sets status() to "error"', ->
            expect(@resourceItem.status()).toBe 'error'

        describe 'when http responds successfully', ->

          beforeEach ->
            # http callback
            @http.calls[0].args[1] 200,
              JSON.stringify [
                {id:123, name:'Grace'}
                {id:456, name:'Peter'}
              ]
              true

          it 'adds all Models', ->
            expect(@resourceItem.at(0).attributes()).toEqual
              id: 123
              name: 'Grace'

            expect(@resourceItem.at(1).attributes()).toEqual
              id: 456
              name: 'Peter'

          it 'sets status() to "ok"', ->
            expect(@resourceItem.status()).toBe 'ok'

    describe 'ResourceCollectionInstance', ->
      it 'is an instanceof Collection', ->
      describe '@requery( params:object ) : ', ->

    describe 'Resource.Instance', ->
      describe '@delete( params:object ) : Resource.Instance', ->
      describe '@save( params:object ) : Resource.Instance', ->


