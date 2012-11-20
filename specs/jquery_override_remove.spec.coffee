define ['./spec-utils'], ({nodeHTMLEquals,stringify,node})->

  ({beforeEachRequire})->

    beforeEachRequire ['cell'], (@cell)->
      
    describe 'jQuery Extensions', ->
      beforeEach ->
        @$testEl =
          $ """
            <div id='one'>
              <div id='two' cell='two'>
                <div id='four' cell='four'></div>
                <div id='five'></div>
              </div>
              <div id='three'></div>
            </div>
            """
        $('body').append @$testEl

        # Install spied listeners of 'cell-remove' custom event
        @removeHandlers = {}
        _(['one','two','three','four','five']).each (elId)=>
          $("##{elId}").on 'cell-remove', @removeHandlers[elId] = jasmine.createSpy "'#{elId} remove spy'"

      afterEach ->
        @$testEl.remove()

      describe 'jQuery.remove() extension', ->

        describe "when jQuery.remove() is called", ->

          beforeEach ->
            @$testEl.remove()

          it "trigger's 'cell-remove' event on elements or descendant elements that have cell attribute", ->
            _(['two','four']).each (elId)=>
              expect(@removeHandlers[elId].callCount).toBe 1

          it "'cell-remove' event is NOT triggered on elements or descendant elements that do NOT HAVE cell attribute", ->
            _(['one','three','five']).each (elId)=>
              expect(@removeHandlers[elId]).not.toHaveBeenCalled()

        describe "when jQuery.detach() is called", ->

          beforeEach ->
            @$testEl.detach()

          it "no 'cell-remove' handler is triggered", ->
            _(['one','two','three','four','five']).each (elId)=>
              expect(@removeHandlers[elId]).not.toHaveBeenCalled()

