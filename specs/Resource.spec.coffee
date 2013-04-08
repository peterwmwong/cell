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


    describe 'new Resource( url:string, defaultParams:object )', ->
      beforeEach ->
        @resource = new @Resource '/{defaultPathParam}/{pathParam}', defaultPathParam:'default'

      describe '@genUrl( params:object, disableQueryParams:boolean ) : String', ->

        describeGenUrl = (urlWithParams, inputParams, outputUrl, outputUrlDisableQueryParams)->
          inputParamsDisableQueryParams = {}
          for k of inputParams
            inputParamsDisableQueryParams[k] = inputParams[k]

          it "When url is '#{urlWithParams}', resource.genUrl( #{JSON.stringify inputParams}, false ) === '#{outputUrl}'", ->
            resource = new @Resource urlWithParams
            expect(resource.genUrl inputParams ).toBe outputUrl

          it "... with disableQueryParams === true, resource.genUrl( #{JSON.stringify inputParamsDisableQueryParams}, true ) === '#{outputUrlDisableQueryParams}'", ->
            resource = new @Resource urlWithParams
            expect(resource.genUrl inputParamsDisableQueryParams, true ).toBe outputUrlDisableQueryParams

        params = -> one: 1, two2: 'deux', thr_ee: '{san}'
        describeGenUrl '/x', params(), '/x?one=1&two2=deux&thr_ee=%7Bsan%7D', '/x'
        describeGenUrl '/x/{one}', params(), '/x/1?two2=deux&thr_ee=%7Bsan%7D', '/x/1'
        describeGenUrl '/x/{thr_ee}', params(), '/x/%7Bsan%7D?one=1&two2=deux', '/x/%7Bsan%7D'
        describeGenUrl '/x/{one}/{two2}/{thr_ee}', params(), '/x/1/deux/%7Bsan%7D', '/x/1/deux/%7Bsan%7D'

      describe '@create( attributes:object ) : Resource.Instance', ->
        beforeEach ->
          @resourceItem = @resource.create
            one: 1
            two: 'duex'
            three: 'san'

        it 'should NOT issue a HTTP request', ->
          expect(@http).not.toHaveBeenCalled()

        it 'creates an empty Resource.Instance (Model)', ->
          expect(@resourceItem instanceof @Resource.Instance).toBe true
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
              data:
                JSON.stringify
                  one: 1
                  two: 'duex'
                  three: 'san'

        describe 'when $delete() is called', ->
          beforeEach ->
            @resourceItem.$delete pathParam:'pathParam', queryParam:'queryValue'

          it "does NOT issue a HTTP request (because it's new)", ->
            expect(@http).not.toHaveBeenCalled()

      describe '@get( params:object ) : Resource.Instance', ->

        beforeEach ->
          @resourceItem = @resource.get pathParam:'path', queryParam:'queryValue'

        it 'issues a HTTP request', ->
          expect(@http).toHaveBeenCalledWithCallback
            method: 'GET'
            url: '/default/path?queryParam=queryValue'

        it 'creates an empty Resource.Instance (Model)', ->
          expect(@resourceItem instanceof @Resource.Instance).toBe true
          expect(@resourceItem instanceof @Model).toBe true
          expect(@resourceItem.attributes()).toEqual {}

        describe 'when http JSON response received', ->

          beforeEach ->
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

          describe 'when $save() is called', ->
            beforeEach ->
              @http.reset()
              @resourceItem.set 'one', 'yi'
              @resourceItem.$save pathParam:'pathParam', queryParam:'queryValue'

            it 'issues a HTTP PUT request', ->
              expect(@http).toHaveBeenCalledWithCallback
                method: 'PUT'
                url: '/default/pathParam?queryParam=queryValue'
                data:
                  JSON.stringify
                    one: 'yi'
                    two: 'deux'
                    three: 'san'

          describe 'when $delete() is called', ->
            beforeEach ->
              @http.reset()
              @resourceItem.$delete pathParam:'pathParam', queryParam:'queryValue'

            it 'issues a HTTP PUT request', ->
              expect(@http).toHaveBeenCalledWithCallback
                method: 'DELETE'
                url: '/default/pathParam?queryParam=queryValue'

      describe '#query( params:object ) : ResourceCollectionInstance', ->

        beforeEach ->
          @resourceItem = @resource.query pathParam:'path', queryParam:'queryValue'

        it 'issues a HTTP request', ->
          expect(@http).toHaveBeenCalledWithCallback
            method: 'GET'
            url: '/default/path?queryParam=queryValue'

        it 'creates an empty Resource.CollectionInstance (Model)', ->
          expect(@resourceItem instanceof @Resource.CollectionInstance).toBe true
          expect(@resourceItem instanceof @Collection).toBe true
          expect(@resourceItem.length()).toBe 0

        describe 'when http JSON response received', ->

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

    describe 'ResourceCollectionInstance', ->
      it 'is an instanceof Collection', ->
      describe '@requery( params:object ) : ', ->

    describe 'Resource.Instance', ->
      describe '@delete( params:object ) : Resource.Instance', ->
      describe '@save( params:object ) : Resource.Instance', ->


