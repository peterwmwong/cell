define ->
   class MockCell
      constructor: (@name = 'mockCell', @template = {}) ->

   class MockNode
      constructor: (appendChild=(->), replaceChild=(->)) ->
         @appendChild = sinon.spy appendChild
         @parentNode =
            replaceChild: sinon.spy replaceChild

   noThrow = (func) ->
      try func()
      catch e
         ok false, 'Should NOT throw exception'


   $testObj: 'cell/CellInstance'

   '<init>() uses cell/config/defaultTemplateRenderer' : (require, get, done) ->

      rendererSpy = sinon.spy()
      require.def 'cell/config', ->
         defaultTemplateRenderer:
            value: rendererSpy

      get (CellInstance) ->
         cellMock = new MockCell()
         nodeStub = new MockNode()
         dataMock = {}
         callbackSpy = sinon.spy()

         ci = noThrow -> CellInstance cellMock, 0, undefined, nodeStub, false, dataMock, callbackSpy

         # Attributes
         equal ci.cell, cellMock, '@cell'
         equal ci.data, dataMock, '@data'

         # renderer called with correct arguments
         ok rendererSpy.calledOnce, 'renderer called once'
         equal rendererSpy.args[0].length, 4, 'renderer passed 4 arguments'
         equal rendererSpy.args[0][0], cellMock, 'renderer arg[0] is cell'
         equal rendererSpy.args[0][2], dataMock, 'renderer arg[2] is data'
         rendererCallback = rendererSpy.args[0][3]
         equal typeof rendererCallback, 'function', 'renderer argument[3] is a function (callback)'

         # target node not modified before renderer callback
         acSpy = nodeStub.appendChild
         rcSpy = nodeStub.parentNode.replaceChild
         ok not acSpy.called, 'targetNode.appendChild should NOT be called before renderer callback'
         ok not rcSpy.called, 'targetNode.parentNode.replaceChild should NOT be called renderer callback'

         containerNodeMock = rendererSpy.args[0][1].node = {}
         noThrow -> rendererCallback()

         # target node appended to after renderer callback
         ok acSpy.calledOnce, 'targetNode.appendChild should be called once'
         equal acSpy.args.length, 1, 'targetNode.appendChild passed 4 arguments'
         equal acSpy.args[0][0], containerNodeMock, 'targetNode.appendChild arg[0] is containerNodeMock'
         ok not rcSpy.called, 'targetNode.parentNode.replaceChild should NOT be called'

         done()


   '<init>() uses cell delegate templateRenderer' : (require, get, done) ->

      rendererSpy = sinon.spy()
      require.def 'cell/config', ->
         defaultTemplateRenderer:
            value: rendererSpy

      get (CellInstance) ->
         cellMock = new MockCell()
         dataMock = {}
         callbackSpy = sinon.spy()
         cellRendererSpy = sinon.spy()

         ci = noThrow -> CellInstance cellMock, 0, {templateRenderer:cellRendererSpy}, new MockNode(), false, dataMock, callbackSpy

         # Attributes
         equal ci.cell, cellMock, '@cell'
         equal ci.data, dataMock, '@data'

         # renderer called with correct arguments
         ok not rendererSpy.called, 'cell/config/defaultTemplateRenderer is NOT called'

         ok cellRendererSpy.calledOnce, 'cell delegate templateRenderer called once'
         equal cellRendererSpy.args[0].length, 4, 'renderer passed 4 arguments'
         equal cellRendererSpy.args[0][0], cellMock, 'renderer arg[0] is cell'
         equal cellRendererSpy.args[0][2], dataMock, 'renderer arg[2] is data'
         equal typeof cellRendererSpy.args[0][3], 'function', 'renderer argument[3] is a function (callback)'

         done()


   '<init>() uses cell delegate getRenderData' : (require, get, done) ->

      rendererSpy = sinon.spy()
      require.def 'cell/config', ->
         defaultTemplateRenderer:
            value: rendererSpy

      get (CellInstance) ->
         cellMock = new MockCell()
         dataMock = {}
         callbackSpy = sinon.spy()
         renderDataMock = {}
         getRenderDataSpy = sinon.spy (data,cb) -> cb(renderDataMock)

         ci = noThrow -> CellInstance cellMock, 0, {getRenderData:getRenderDataSpy}, new MockNode(), false, dataMock, callbackSpy

         ok getRenderDataSpy.calledOnce, 'cell delegate getRenderData called once'
         equal getRenderDataSpy.args[0][0], dataMock, 'cell delegate getRenderData arg[0] is data'
         equal typeof getRenderDataSpy.args[0][1], 'function', 'cell delegate getRenderData arg[1] is a function (callback)'

         # Attributes
         equal ci.cell, cellMock, '@cell'
         equal ci.data, renderDataMock, '@data'

         # renderer called with correct arguments
         ok rendererSpy.calledOnce, 'templateRenderer called once'
         equal rendererSpy.args[0].length, 4, 'renderer passed 4 arguments'
         equal rendererSpy.args[0][0], cellMock, 'renderer arg[0] is cell'
         equal rendererSpy.args[0][2], renderDataMock, 'renderer arg[2] is data'
         
         done()


   '<init>() can replace targetNode' : (require, get, done) ->

      rendererSpy = sinon.spy()
      require.def 'cell/config', ->
         defaultTemplateRenderer:
            value: rendererSpy

      get (CellInstance) ->
         cellMock = new MockCell()
         nodeStub = new MockNode()
         dataMock = {}
         callbackSpy = sinon.spy()

         ci = noThrow -> CellInstance cellMock, 0, undefined, nodeStub, true, dataMock, callbackSpy

         rendererCallback = rendererSpy.args[0][3]

         # target node not modified before renderer callback
         acSpy = nodeStub.appendChild
         rcSpy = nodeStub.parentNode.replaceChild
         ok not acSpy.called, 'targetNode.appendChild should NOT be called before renderer callback'
         ok not rcSpy.called, 'targetNode.parentNode.replaceChild should NOT be called renderer callback'

         containerNodeMock = rendererSpy.args[0][1].node = {}
         noThrow -> rendererCallback()

         # target node appended to after renderer callback
         ok rcSpy.calledOnce, 'targetNode.parentNode.replaceChild should be called once'
         equal rcSpy.args[0].length, 2, 'targetNode.parentNode.replaceChild passed 2 arguments'
         equal rcSpy.args[0][0], containerNodeMock, 'targetNode.parentNode.replaceChild arg[0] is containerNodeMock'
         equal rcSpy.args[0][1], nodeStub, 'targetNode.parentNode.replaceChild arg[1] is targetNode'
         ok not acSpy.called, 'targetNode.parentNode.replaceChild should NOT be called'

         done()
