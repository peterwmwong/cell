define ->
   mockHTML = mockMustache = mockConfig = undefined

   $testObj: 'cell/integration/templating/mustache-template-renderer'

   $beforeTest: (require,done)->
      mockHTML = 'test html'

      delete window.Mustache
      mockMustache = window.Mustache =
         to_html: sinon.spy -> mockHTML

      require.def 'cell/Config', [], ->
         mockConfig =
            set: sinon.spy()

      require ['cell/Config'], done


   'require("cell/integration/templating/mustache-template-render"): Should register Config "template.renderer"': (require,get,done)-> get ->
      ok mockConfig.set.calledOnce and mockConfig.set.calledWith('template.renderer')
      done()

      
   '({template,data},done): Should call Mustache parser passing {template,data} and calling {done} with rendered template': (require,get,done)-> get ->
      doneSpy = sinon.spy()
      mockData = {}
      mockConfig.set.getCall(0).args[1] {template:'test template',data:mockData}, doneSpy

      tohtmlCall = mockMustache.to_html.getCall(0)
      ok mockMustache.to_html.calledOnce and tohtmlCall.calledWith('test template', mockData), 'Should call Mustache.to_html() once and pass {template} and {data}'

      ok doneSpy.calledOnce, 'Should call {done} once'
      {html, nestedRequests} = doneSpy.getCall(0).args[0]
      equal html, mockHTML, 'Should pass rendered HTML to {done}'
      ok nestedRequests instanceof Array and nestedRequests.length == 0, 'Should pass empty array of nested render requests to {done}'

      done()


   '({template,data},done): Should handle Mustache template partials as nested Cell render requests': (require,get,done)-> get ->
      doneSpy = sinon.spy()
      mockData = {}
      partials = for i in [0..5]
         do(i)->
            name: 'partial'+i,
            data: {},
            id: 'testid'+i
            tag: [undefined,'div','span','tr','a','td'][i]

      mockMustache = window.Mustache =
         to_html: sinon.spy (template,data,{getPartial})->
            mockHTML = ''
            for {name, data, id, tag} in partials
               mockHTML += getPartial name, data, id, tag
            mockHTML

      mockConfig.set.getCall(0).args[1] {template:'test template',data:mockData}, doneSpy

      tohtmlCall = mockMustache.to_html.getCall(0)
      ok mockMustache.to_html.calledOnce and tohtmlCall.calledWith('test template', mockData), 'Should call Mustache.to_html() once and pass {template} and {data}'

      ok doneSpy.calledOnce, 'Should call {done} once'
      {html, nestedRequests} = doneSpy.getCall(0).args[0]
      equal html, mockHTML, 'Should pass rendered HTML to {done}'
      ok nestedRequests instanceof Array and nestedRequests.length == partials.length, 'Should pass array of nested render requests to {done}'

      partials.forEach ({name,data,id,tag},i)->
         r = nestedRequests[i]
         ok r.cell, name, "Nested request [#{i}] {cell} should be partials name"
         ok r.data, data, "Nested request [#{i}] {data} should be partials data"
         ok r.id, id, "Nested request [#{i}] {id} should be partials id"
         tmpNodeHTML = "id='#{r.replace}'"
         ok r.tag == tag, "Nested request [#{i}] {tag} should be an CSS tag selector #{tag} #{r.tag}"
         ok typeof r.replace == 'string', "Nested request [#{i}] {replace} should be an id"
         ok mockHTML.indexOf(tmpNodeHTML) == mockHTML.lastIndexOf(tmpNodeHTML) > -1, "Nested request [#{i}] {to} should be a node id in rendered partial (and only one)"
      done()


