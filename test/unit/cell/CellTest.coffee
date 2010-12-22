define ->
 
   # Spies used by tests are initialed and injected before each test
   attachCSSSpy = undefined
   attachHTMLSpy = undefined
   defaultStyleRenderer = undefined
   defaultTemplateRenderer = undefined
   
   $testObj: 'cell/Cell'
   $beforeTest: (require,done)->
      defaultStyleRenderer = sinon.spy()
      defaultTemplateRenderer = sinon.spy()
      attachCSSSpy = sinon.spy()
      attachHTMLSpy = sinon.spy()
      MockConfig =
         get: (k)-> switch k
            when "renderer.style" then defaultStyleRenderer
            when "renderer.template" then defaultTemplateRenderer

      require.def 'cell/Config', [], -> MockConfig
      require.def 'cell/util/attachCSS', [], -> attachCSSSpy
      require.def 'cell/util/attachHTML', [], -> attachHTMLSpy
      require ['cell/Eventful','cell/Config','cell/util/attachCSS','cell/util/attachHTML'], done


   'new Cell(name, template, style): throws error if name is empty, undefined, null, or not a string': (require,get,done)-> get (Cell)->
      ['','  ',undefined,null,->].forEach (name)->
         try ok not (new Cell name,'',''), "Should throw error if name is '#{name}'"
      done()


   'new Cell(name, template, style): constructor arguments are used for name, template, and style properties': (require,get,done)-> get (Cell)->
      cell = new Cell 'testName', 'testTemplate', 'testStyle'

      equal cell.name, 'testName', 'name property should be the 0 constructor argument'
      equal cell.template, 'testTemplate', 'template property should be the 1 constructor argument'
      equal cell.style, 'testStyle', 'style property should be the 2 constructor argument'

      done()


   'name, template, and style properties are read-only and unconfigurable': (require,get,done)-> get (Cell)->
      cell = new Cell 'test', 'test', 'test'
      for p in ['name','template','style']
         cell[p] = 'BLARG'
         equal cell[p], 'test', "#{p} property should be read-only"
         delete cell[p]
         equal cell[p], 'test', "#{p} property should NOT be configurable"
      done()


   'renderStyle(): calls cell/Config.get("renderer.style") if no "render.style" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.renderStyle()

      ok defaultStyleRenderer.calledOnce and defaultStyleRenderer.calledWith('style'),
         "Default renderer, cell/Config.get('renderer.style'), should be called once and passed style"
      done()


   'renderStyle(): calls "render.style" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      handlerSpy = sinon.spy()
      cell.handle 'render.style', handlerSpy
      cell.renderStyle()

      ok not defaultStyleRenderer.calledOnce, "Default renderer, cell/Config.get('renderer.style'), should NOT be called"
      ok handlerSpy.calledOnce and handlerSpy.calledWith('style'),
         "'renderer.style' handler should be called once and passed style"
      done()


   'renderStyle(): calls cell/util/attachCSS': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.renderStyle()
      defaultStyleRenderer.args[0][1]('css')

      ok attachCSSSpy.calledOnce and attachCSSSpy.calledWithExactly('name','css'),
         "cell/util/attachCSS should be called once and passed name and rendered css"
      done()


   'renderStyle(): multiple calls will only render/attach style once': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.renderStyle()
      defaultStyleRenderer.args[0][1]('css')

      ok attachCSSSpy.calledOnce, "cell/util/attachCSS should be called once the first time"

      cell.renderStyle()

      ok defaultStyleRenderer.calledOnce, "Default renderer should only be called once"
      ok attachCSSSpy.calledOnce, "cell/util/attachCSS should only be called once"

      done()


   'render({data,to}): calls cell/Config.get("renderer.template") if no "render.template" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.render data: 'data', to: 'to'

      ok defaultTemplateRenderer.calledOnce and defaultTemplateRenderer.calledWith(template: 'tmpl', data: 'data'),
         "Default renderer, cell/Config.get('renderer.template'), should be called once and passed {template, data}"
      done()


   'render({data,to}): calls "render.template" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      handlerSpy = sinon.spy()
      cell.handle 'render.template', handlerSpy
      cell.render data: 'data', to: 'to'

      ok not defaultTemplateRenderer.calledOnce, "Default renderer, cell/Config.get('renderer.template'), should NOT be called"
      ok handlerSpy.calledOnce and handlerSpy.calledWith(template: 'tmpl', data: 'data'),
         "'renderer.template' handler should be called once and passed {template, data}"
      done()


   'render({data,to}): calls cell/util/attachHTML': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.render data: 'data', to: 'to'
      defaultTemplateRenderer.args[0][1]('html')

      ok attachHTMLSpy.calledOnce and attachHTMLSpy.calledWithExactly('name','html','to'),
         "cell/util/attachHTML should be called once and passed name, rendered html, and to"
      done()
