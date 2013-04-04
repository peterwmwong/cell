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

      describe '@create( params:object ) : Resource.Instance', ->

        beforeEach ->
          @resourceItem = @resource.create
            pathParam: 'path'
            one: 1
            two: 'duex'
            three: 'san'

        it 'issues a HTTP request', ->
          expect(@http).toHaveBeenCalledWithCallback
            method: 'POST'
            url: '/default/path'
            data: JSON.stringify
              one: 1
              two: 'duex'
              three: 'san'

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

          it 'assigns all properties', ->
            expect(@resourceItem.attributes()).toEqual
              one: 1
              two: 'deux'
              three: 'san'

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

          it 'assigns all properties', ->
            expect(@resourceItem.attributes()).toEqual
              one: 1
              two: 'deux'
              three: 'san'

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


