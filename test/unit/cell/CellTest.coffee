define ->
   defer = (t,f)-> setTimeout f,t

   # Spies used by tests are initialed and injected before each test
   attachCSSSpy = undefined
   defaultStyleRenderer = undefined
   defaultTemplateRenderer = undefined
   mockCellPlugin = undefined
   mCellRendering = undefined

   # Helpers
   $ = document.querySelector.bind document
   $$ = document.querySelectorAll.bind document
   equal
   assertCallOnce = (desc,spy,expArgs...)->
      ok spy.calledOnce, "#{desc} called once"
      i = 0
      for expArg in expArgs
         arg = spy.args[0][i]
         unless typeof expArg == 'object'
            equal arg, expArg, "#{desc} argument #{i} #{arg} === #{expArg}"
         else
            deepEqual arg, expArg, "#{desc} argument #{i} (object) #{arg} === #{expArg}"

   assertCellRenderingCall = (thisBind, eCell,eData,eNodeIds)->
      ok mCellRendering.calledOn(thisBind), 'CellRendering called bound to proper this binding'
      ok mCellRendering.calledOnce and mCellRendering.calledWith(eCell,eData), 'CellRendering called once and passed proper {cell}, {data}'
      nodes = mCellRendering.args[0][2]
      for i in [0..eNodeIds.length-1]
         equal nodes[i].id, eNodeIds[i], 'CellRendering passed proper {nodes}'

   assertNodeInnerHTML = (sel, expectedInnerHTML)->
      body = document.body.innerHTML
      nodes = $$ sel
      equal nodes.length, 1, "one and only one node (#{sel}) should exist in '#{body}'"
      equal nodes[0].innerHTML, expectedInnerHTML, "node innerHTML '#{nodes[0].innerHTML}' should be '#{expectedInnerHTML}' HTML"

   $testObj: 'cell/Cell'
   $afterTest: (done)->
      document.body.innerHTML = ''
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


   'new Cell(name, template, style): constructor arguments are used for name, path, template, and style properties': (require,get,done)-> get (Cell)->
      cell = new Cell 'testName', 'testTemplate', 'testStyle'

      equal cell.name, 'testName', 'name property should be the 0 constructor argument'
      equal cell.path, '', 'path property should be derived from name property'
      equal cell.template, 'testTemplate', 'template property should be the 1 constructor argument'
      equal cell.style, 'testStyle', 'style property should be the 2 constructor argument'

      done()


   'new Cell(name, template, style): path property derived from name "name", "rel/name", "rel1/rel2/name", and "/name" ': (require,get,done)-> get (Cell)->
      [['name',''],
       ['rel/name','rel/'],
       ['rel1/rel2/name','rel1/rel2/'],
       ['/name','/']].forEach ([cname,cpath])->
         cell = new Cell cname, 'testTemplate', 'testStyle'
         equal cell.path, cpath, "given name '#{cname}', path should be '#{cpath}' (#{cell.path})"

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


   'render({data,replace}): calls cell/Config.get("template.renderer") if no "render.template" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      cell.render {data: 'data', replace: 'replace'}
      ok defaultTemplateRenderer.calledOnce and defaultTemplateRenderer.calledWith(template: 'tmpl', data: 'data'),
         "Default renderer, cell/Config.get('template.renderer'), should be called once and passed {template, data}"
      ok typeof defaultTemplateRenderer.args[0][1], 'function', 'Default renderer should be passed callback function'
      done()


   'render({data,replace}): calls "render.template" handler': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      handlerSpy = sinon.spy()
      cell.handle 'render.template', handlerSpy
      cell.render {data: 'data', replace: 'replace'}
      ok not defaultTemplateRenderer.calledOnce, "Default renderer, cell/Config.get('template.renderer'), should NOT be called"
      ok handlerSpy.calledOnce and handlerSpy.calledWith(template: 'tmpl', data: 'data'),
         "'template.renderer' handler should be called once and passed {template, data}"
      ok typeof handlerSpy.args[0][1], 'function', "'template.renderer' handler should be passed callback function"
      done()


   'render({data}): throws error if {replace}, {appendTo}, {prependTo}, {before}, or {after} is not specified': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      try
         cell.render {data: 'data'}
         ok false, 'Should throw error'

      done()


   'render({data,replace}): emits "render" event, calls "render" listeners, and passes the instance of CellRendering to listeners': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'
      document.body.innerHTML = "<div id='testNode'></div>"

      cell.on 'render', (rendering)->
         assertNodeInnerHTML 'body > div#testRender', 'rendered'
         assertCellRenderingCall rendering, cell, 'data', ['testRender']
         done()

      cell.render data:'data', replace:$('#testNode')

      # Handle render.template request
      defaultTemplateRenderer.args[0][1] html: '<div id="testRender">rendered</div>'


   'render({data,replace},done): renders template to {replace} node, calls {done}, and passes the instance of CellRendering to {done}': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'

      document.body.innerHTML = "<div id='testNode'></div>"

      cell.render data:'data',replace:$('#testNode'), (rendering)->
         equal $$('div#testNode').length, 0, '{replace} node should not exist and be replaced by the container node'
         assertNodeInnerHTML 'body > div#testRender', 'rendered'
         assertCellRenderingCall rendering, cell, 'data', ['testRender']
         done()

      # Handle render.template request
      defaultTemplateRenderer.args[0][1] html: '<div id="testRender">rendered</div>'


   'render({data,appendTo},done): renders template and appends it to {appendTo} node ': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'

      document.body.innerHTML =
         """
         <div id='testNode'>
            <div id='testChildNode'></div>
         </div>
         """
 
      cell.render data:'data', appendTo:$('#testNode'), (rendering)->
         assertNodeInnerHTML 'body > div#testNode > div:nth-of-type(2)#testRender', 'rendered'
         done()

      # Handle render.template request
      defaultTemplateRenderer.args[0][1] html: '<div id="testRender">rendered</div>'



   'render({data,prependTo},done): renders template and appends it to {prependTo} node ': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'

      document.body.innerHTML =
         """
         <div id='testNode'>
            <div id='testChildNode'></div>
         </div>
         """
 
      cell.render data:'data', prependTo:$('#testNode'), (rendering)->
         assertNodeInnerHTML 'body > div#testNode > div:nth-of-type(1)#testRender', 'rendered'
         done()

      # Handle render.template request
      defaultTemplateRenderer.args[0][1] html: '<div id="testRender">rendered</div>'



   'render({data,before},done): renders template and appends it to {before} node ': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'

      document.body.innerHTML =
         """
         <div id='testNode'>
            <div id='testChildNode'></div>
         </div>
         """
 
      cell.render data:'data', before:$('#testChildNode'), (rendering)->
         assertNodeInnerHTML 'body > div#testNode > div:nth-of-type(1)#testRender', 'rendered'
         done()

      # Handle render.template request
      defaultTemplateRenderer.args[0][1] html: '<div id="testRender">rendered</div>'


   'render({data,after},done): renders template and appends it to {after} node ': (require,get,done)-> get (Cell)->
      cell = new Cell 'name', 'tmpl', 'style'

      document.body.innerHTML =
         """
         <div id='testNode'>
            <div id='testChildNode'></div>
         </div>
         """
 
      cell.render data:'data', after:$('#testChildNode'), (rendering)->
         assertNodeInnerHTML 'body > div#testNode > div:nth-of-type(2)#testRender', 'rendered'
         done()

      # Handle render.template request
      defaultTemplateRenderer.args[0][1] html: '<div id="testRender">rendered</div>'


   'render({data,replace},done): Errors thrown by {done} does not prevent loading and rendering of nested cells': (require,get,done)-> get (Cell)->
      nested_one = render: sinon.spy()
      nested_two = render: sinon.spy()
      mockRenderedHTML = '<div id="nested_one_to"></div><div id="nested_two_to"></div>'
      mockCellPlugin.load = (name,require,done)->
         switch name
            when 'nested_one' then done nested_one
            when 'nested_two' then done nested_two
            else throw new Error 'DAMMIT'

      document.body.innerHTML = "<div id='testNode'></div>"

      cell = new Cell 'name', 'tmpl', 'style'

      cell.render data:'data', replace:$('#testNode'), (rendering)->
         throw new Error()

      # Handle render.template request, w/nested requests
      defaultTemplateRenderer.args[0][1]
         html:mockRenderedHTML
         nestedRequests: [
            {cell:'nested_one',data:'nested_one.data',before:'nested_one_to'}
            {cell:'nested_two',data:'nested_two.data',appendTo:'nested_two_to'}
         ]

      defer 0, ->
         equal $$('div#testNode').length, 0, '{replace} node should not exist and be replaced by the container node'

         assertCallOnce "first nested cell render()", nested_one.render,
            data: 'nested_one.data'
            attach:
               method:'before'
               target:$('body > #nested_one_to')

         assertCallOnce "first nested cell render()", nested_two.render,
            data: 'nested_two.data'
            attach:
               method:'appendTo'
               target:$('body > #nested_two_to')

         done()

 
   'render({data,replace},done): loads and renders nested cells': (require,get,done)-> get (Cell)->
      nested_one = render: sinon.spy()
      nested_two = render: sinon.spy()
      mockRenderedHTML = '<div id="nested_one_to"></div><div id="nested_two_to"></div>'
      mockCellPlugin.load = (name,require,done)->
         switch name
            when 'nested_one' then done nested_one
            when 'nested_two' then done nested_two
            else throw new Error 'DAMMIT'

      document.body.innerHTML = "<div id='testNode'></div>"

      cell = new Cell 'name', 'tmpl', 'style'

      cell.render data:'data', replace:$('#testNode')

      # Handle render.template request, w/nested requests
      defaultTemplateRenderer.args[0][1]
         html:mockRenderedHTML
         nestedRequests: [
            {cell:'nested_one',data:'nested_one.data',before:'nested_one_to'}
            {cell:'nested_two',data:'nested_two.data',appendTo:'nested_two_to'}
         ]

      defer 0, ->
         equal $$('div#testNode').length, 0, '{replace} node should not exist and be replaced by the container node'
         assertCallOnce "first nested cell render()", nested_one.render,
            data: 'nested_one.data'
            attach:
               method:'before'
               target:$('body > #nested_one_to')

         assertCallOnce "first nested cell render()", nested_two.render,
            data: 'nested_two.data'
            attach:
               method:'appendTo'
               target:$('body > #nested_two_to')

         done()

   'render({data,replace},done): loads and renders nested cells with relative paths': (require,get,done)-> get (Cell)->
      nested_one = render: sinon.spy()
      nested_two = render: sinon.spy()
      mockRenderedHTML = '<div id="nested_one_to"></div><div id="nested_two_to"></div>'
      mockCellPlugin.load = (name,require,done)->
         switch name
            when 'root/nested_one' then done nested_one
            when 'root/nested_two' then done nested_two
            else throw new Error 'DAMMIT'

      document.body.innerHTML = "<div id='testNode'></div>"

      cell = new Cell 'root/name', 'tmpl', 'style'

      cell.render {data:'data',replace:testNode}

      # Handle render.template request, w/nested requests
      defaultTemplateRenderer.args[0][1]
         html:mockRenderedHTML
         nestedRequests: [
            {cell:'nested_one',data:'nested_one.data',replace:'nested_one_to'}
            {cell:'nested_two',data:'nested_two.data',replace:'nested_two_to'}
         ]

      defer 0, ->
         equal $$('div#testNode').length, 0, '{replace} node should not exist and be replaced by the container node'

         assertCallOnce "first nested cell render()", nested_one.render,
            data: 'nested_one.data'
            attach:
               method:'replace'
               target:$('body > #nested_one_to')

         assertCallOnce "first nested cell render()", nested_two.render,
            data: 'nested_two.data'
            attach:
               method:'replace'
               target:$('body > #nested_two_to')

         done()
