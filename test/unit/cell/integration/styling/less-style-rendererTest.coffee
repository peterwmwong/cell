define ->
   mockLess = mockConfig = undefined

   $testObj: 'cell/integration/styling/less-style-renderer'

   $beforeTest: (require,done)->
      delete window.less
      mockLess = window.less =
         Parser: sinon.spy ->
            parse: sinon.spy()

      require.def 'cell/Config', [], ->
         mockConfig =
            set: sinon.spy()

      require ['cell/Config'], done


   'require("cell/integration/styling/less-style-render"): Should register Config "style.renderer"': (require,get,done)-> get ->
      ok mockConfig.set.calledOnce and mockConfig.set.calledWith('style.renderer')
      done()

      
   '(style,done): Should call LESS parser passing {style} and calling {done} with rendered CSS': (require,get,done)-> get ->
      doneSpy = sinon.spy()
      mockConfig.set.getCall(0).args[1]('test less',doneSpy)

      parseCall = mockLess.Parser.getCall(0).returnValue.parse
      ok mockLess.Parser.calledOnce and parseCall.calledOnce and parseCall.calledWith('test less'), 'Should call LESS parser once and pass {style}'

      parseCall.args[0][1] undefined, {toCSS: -> 'test css'}
      ok doneSpy.calledOnce and doneSpy.calledWithExactly('test css',undefined), 'Should call {done} with CSS'
      done()


   '(style,done): Should pass {done} any errors from LESS parser': (require,get,done)-> get ->
      doneSpy = sinon.spy()
      mockConfig.set.getCall(0).args[1]('test less',doneSpy)
      parseCall = mockLess.Parser.getCall(0).returnValue.parse
      mockError = {}
      parseCall.args[0][1] mockError, {toCSS: -> 'test css'}

      ok doneSpy.calledOnce and doneSpy.calledWithExactly('test css',mockError), 'Should call {done} with CSS and error'
      done()
