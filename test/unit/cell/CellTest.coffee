define ->
   defer = (t,f)-> setTimeout f,t

   # Spies used by tests are initialed and injected before each test
   attachCSSSpy = undefined
   defaultStyleRenderer = undefined
   defaultTemplateRenderer = undefined
   mockCellPlugin = undefined
   mCellRendering = undefined

   $testObj: 'cell/Cell'
   $afterTest: (done)->
      # Clear body
      while document.body.firstChild
         document.body.removeChild document.body.firstChild
      done()

   $beforeTest: (require,done)->
      defaultStyleRenderer = sinon.spy()
      defaultTemplateRenderer = sinon.spy()
      attachCSSSpy = sinon.spy()
      mockCellPlugin =
         load: (name, require, done)-> done name
      mCellRendering = sinon.spy()
      MockConfig =
         get: (k)-> switch k
            when "style.renderer" then defaultStyleRenderer
            when "template.renderer" then defaultTemplateRenderer

      require.def 'cell', [], mockCellPlugin
      require.def 'cell/Config', [], -> MockConfig
      require.def 'cell/CellRendering', [], -> mCellRendering
      require.def 'cell/util/attachCSS', [], -> attachCSSSpy
      require ['cell','cell/Eventful','cell/Config','cell/CellRendering','cell/util/attachCSS'], done


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


   'renderStyle(): does not try to render a style that is empty, undefined, null, or not a string': (require,get,done)-> get (Cell)->
      for style in ['',' ',undefined,null,{}]
         cell = new Cell 'name', 'tmpl', style
         cell.renderStyle()

         ok not defaultStyleRenderer.called, "Style renderer should NOT be called for style='#{style}'"
      done()


   'renderStyle(): calls cell/Config.get("style.renderer") if no "render.style" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.renderStyle()

      ok defaultStyleRenderer.calledOnce and defaultStyleRenderer.calledWith('style'),
         "Default renderer, cell/Config.get('style.renderer'), should be called once and passed style"
      done()


   'renderStyle(): calls "render.style" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      handlerSpy = sinon.spy()
      cell.handle 'render.style', handlerSpy
      cell.renderStyle()

      ok not defaultStyleRenderer.calledOnce, "Default renderer, cell/Config.get('style.renderer'), should NOT be called"
      ok handlerSpy.calledOnce and handlerSpy.calledWith('style'),
         "'style.renderer' handler should be called once and passed style"
      done()


   'renderStyle(): calls cell/util/attachCSS': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.renderStyle()
      defaultStyleRenderer.args[0][1]('css')

      ok attachCSSSpy.calledOnce and attachCSSSpy.calledWith('name','css'),
         "cell/util/attachCSS should be called once and passed name and rendered css"
      done()


   'renderStyle(): multiple calls will only render/attach style once for each Cell': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.renderStyle()
      defaultStyleRenderer.args[0][1]('css')
      cell.renderStyle()

      ok defaultStyleRenderer.calledOnce, "Default renderer should only be called once"
      ok attachCSSSpy.calledOnce, "cell/util/attachCSS should only be called once"

      cell2 = new Cell 'name2', 'tmpl2', 'style2'
      cell2.renderStyle()
      defaultStyleRenderer.args[0][1]('css')
      cell2.renderStyle()

      equal defaultStyleRenderer.callCount, 2, "Default renderer should only be called twice (2nd Cell)"
      equal attachCSSSpy.callCount, 2, "cell/util/attachCSS should only be called twice (2nd Cell)"
      done()


   'render({data,to}): calls cell/Config.get("template.renderer") if no "render.template" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.render {data: 'data', to: 'to'}
      ok defaultTemplateRenderer.calledOnce and defaultTemplateRenderer.calledWith(template: 'tmpl', data: 'data'),
         "Default renderer, cell/Config.get('template.renderer'), should be called once and passed {template, data}"
      ok typeof defaultTemplateRenderer.args[0][1], 'function', 'Default renderer should be passed callback function'
      done()


   'render({data,to}): calls "render.template" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      handlerSpy = sinon.spy()
      cell.handle 'render.template', handlerSpy
      cell.render {data: 'data', to: 'to'}
      ok not defaultTemplateRenderer.calledOnce, "Default renderer, cell/Config.get('template.renderer'), should NOT be called"
      ok handlerSpy.calledOnce and handlerSpy.calledWith(template: 'tmpl', data: 'data'),
         "'template.renderer' handler should be called once and passed {template, data}"
      ok typeof handlerSpy.args[0][1], 'function', "'template.renderer' handler should be passed callback function"
      done()


   'render({data},done): throws error if {to} is not specified': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      try
         cell.render {data: 'data'}
         ok false, 'Should throw error if {to} is not specified'

      done()


   'render({data,to},done): calls "render" listeners, passing the instance of CellRendering': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'

      cell.on 'render', (rendering)->
         node = document.querySelector 'div#name_0'
         ok mCellRendering.calledOnce and mCellRendering.calledWithExactly(cell,'data',node), 'CellRendering called once and passed cell, data and node'
         ok mCellRendering.calledOn(rendering), '"render" listener was passed the instance of CellRendering'
         done()

      # Attach {to} node
      testNode = document.createElement 'div'
      testNode.id = 'testNode'
      document.body.appendChild testNode

      cell.render {data:'data',to:testNode}

      # Handle render.template request
      defaultTemplateRenderer.args[0][1] html: 'rendered'


   'render({data,to},done): renders template to {to} node and calls {done}, passing the instance of CellRendering': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'

      # Attach {to} node
      testNode = document.createElement 'div'
      testNode.id = 'testNode'
      document.body.appendChild testNode

      cell.render {data:'data',to:testNode}, (rendering)->
         equal document.querySelectorAll('div#testNode').length, 0, '{to} node should not exist and be replaced by the container node'
         node = document.querySelectorAll 'div#name_0'
         equal node.length, 1, 'container node (div#name_0) should exist'
         node = node[0]
         equal node.innerHTML, 'rendered', 'container node should contain rendered html'

         ok mCellRendering.calledOnce and mCellRendering.calledWithExactly(cell,'data',node), 'CellRendering called once and passed cell, data and node'
         ok mCellRendering.calledOn(rendering), '{done} was passed the instance of CellRendering'
         done()

      # Handle render.template request
      defaultTemplateRenderer.args[0][1] html: 'rendered'


   'render({data,to},done): Errors thrown by {done} does not prevent loading and rendering of nested cells': (require,get,done)-> get (Cell)->
      nested_one = render: sinon.spy()
      nested_two = render: sinon.spy()
      mockRenderedHTML = '<div id="nested_one_to"></div><div id="nested_two_to"></div>'
      mockCellPlugin.load = (name,require,done)->
         switch name
            when 'nested_one' then done nested_one
            when 'nested_two' then done nested_two
            else throw new Error 'DAMMIT'

      # Attach {to} node
      testNode = document.createElement 'div'
      testNode.id = 'testNode'
      document.body.appendChild testNode

      cell = new Cell 'name', 'tmpl', 'style'

      [verifiedRenderCallback,verifiedNestedRender] = [false,false]
      cell.render {data:'data',to:testNode}, (rendering)->
         throw new Error()

      # Handle render.template request, w/nested requests
      defaultTemplateRenderer.args[0][1]
         html:mockRenderedHTML
         nestedRequests: [
            {cell:'nested_one',data:'nested_one.data',to:'#nested_one_to'}
            {cell:'nested_two',data:'nested_two.data',to:'#nested_two_to'}
         ]

      defer 0, ->
         equal document.querySelectorAll('div#testNode').length, 0, '{to} node should not exist and be replaced by the container node'
         node = document.querySelectorAll 'div#name_0'
         equal node.length, 1, 'container node (div#name_0) should exist'
         node = node[0]
         equal node.innerHTML, mockRenderedHTML, 'container node should contain rendered html'

         ok nested_one.render.calledOnce, 'first nested cell render() called once'
         arg = nested_one.render.args[0][0]
         equal arg.data, 'nested_one.data', 'first nested cell render() passed {data}'
         equal arg.to, node.querySelector('#nested_one_to'), 'first nested cell render() passed {to}'

         ok nested_two.render.calledOnce, 'second nested cell render() called once'
         arg = nested_two.render.args[0][0]
         equal arg.data, 'nested_two.data', 'second nested cell render() passed {data}'
         equal arg.to, node.querySelector('#nested_two_to'), 'second nested cell render() passed {to}'

         done()


   'render({data,to},done): loads and renders nested cells from template': (require,get,done)-> get (Cell)->
      nested_one = render: sinon.spy()
      nested_two = render: sinon.spy()
      mockRenderedHTML = '<div id="nested_one_to"></div><div id="nested_two_to"></div>'
      mockCellPlugin.load = (name,require,done)->
         switch name
            when 'nested_one' then done nested_one
            when 'nested_two' then done nested_two
            else throw new Error 'DAMMIT'

      # Attach {to} node
      testNode = document.createElement 'div'
      testNode.id = 'testNode'
      document.body.appendChild testNode

      cell = new Cell 'name', 'tmpl', 'style'

      [verifiedRenderCallback,verifiedNestedRender] = [false,false]
      cell.render {data:'data',to:testNode}, (rendering)->
         equal document.querySelectorAll('div#testNode').length, 0, '{to} node should not exist and be replaced by the container node'
         node = document.querySelectorAll 'div#name_0'
         equal node.length, 1, 'container node (div#name_0) should exist'
         node = node[0]
         equal node.innerHTML, mockRenderedHTML, 'container node should contain rendered html'

         ok mCellRendering.calledOnce and mCellRendering.calledWithExactly(cell,'data',node), 'CellRendering called once and passed cell, data and node'
         ok mCellRendering.calledOn(rendering), 'CellRendering called once and passed cell, data and node'
         if (verifiedRenderCallback = true) and verifiedNestedRender
            done()

      # Handle render.template request, w/nested requests
      defaultTemplateRenderer.args[0][1]
         html:mockRenderedHTML
         nestedRequests: [
            {cell:'nested_one',data:'nested_one.data',to:'#nested_one_to'}
            {cell:'nested_two',data:'nested_two.data',to:'#nested_two_to'}
         ]

      defer 0, ->
         equal document.querySelectorAll('div#testNode').length, 0, '{to} node should not exist and be replaced by the container node'
         node = document.querySelectorAll 'div#name_0'
         equal node.length, 1, 'container node (div#name_0) should exist'
         node = node[0]
         equal node.innerHTML, mockRenderedHTML, 'container node should contain rendered html'

         ok nested_one.render.calledOnce, 'first nested cell render() called once'
         arg = nested_one.render.args[0][0]
         equal arg.data, 'nested_one.data', 'first nested cell render() passed {data}'
         equal arg.to, node.querySelector('#nested_one_to'), 'first nested cell render() passed {to}'

         ok nested_two.render.calledOnce, 'second nested cell render() called once'
         arg = nested_two.render.args[0][0]
         equal arg.data, 'nested_two.data', 'second nested cell render() passed {data}'
         equal arg.to, node.querySelector('#nested_two_to'), 'second nested cell render() passed {to}'

         if verifiedRenderCallback and (verifiedNestedRender = true)
            done()


   'render({data,to,id},done): Should create container div with specified id': (require,get,done)-> get (Cell)->
 
      mockRenderedHTML = 'blarg'

      # Attach {to} node
      testNode = document.createElement 'div'
      testNode.id = 'testNode'
      document.body.appendChild testNode

      cell = new Cell 'name', 'tmpl', 'style'
      cell.render {data:'data',to:testNode,id:'testid'}, (rendering)->
         equal document.querySelectorAll('div#testNode').length, 0, '{to} node should not exist and be replaced by the container node'
         node = document.querySelectorAll 'div#testid'
         equal node.length, 1, 'container node (div#testid) should exist'
         node = node[0]
         equal node.innerHTML, mockRenderedHTML, 'container node should contain rendered html'
         done()

      # Handle render.template request, w/nested requests
      defaultTemplateRenderer.args[0][1]
         html:mockRenderedHTML
         nestedRequests: []


   '__createDOMNode(html): creates <div id="{cell}_#" class="{local cell name}">{html}</div>': (require,get,done)-> get (Cell)->
      cell = new Cell 'root/name', 'tmpl', 'style'
      node = cell.__createDOMNode 'html'

      equal node.id, 'root/name_0', 'node id should be {cell}_#'
      equal node.classList.length, 1, 'node should only have 1 class'
      equal node.classList[0], 'name', 'node class should be local cell name (ex. root/name => name)'
      equal node.innerHTML,'html','node innerHTML should be {html}'
      done()

   '__createDOMNode(html,id): uses id when specifed': (require,get,done)-> get (Cell)->
      cell = new Cell 'root/name', 'tmpl', 'style'
      node = cell.__createDOMNode 'html', 'testid'

      equal node.id, 'testid', 'node id should be {id}'
      equal node.classList.length, 1, 'node should only have 1 class'
      equal node.classList[0], 'name', 'node class should be local cell name (ex. root/name => name)'
      equal node.innerHTML,'html','node innerHTML should be {html}'
      done()
