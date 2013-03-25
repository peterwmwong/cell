define ->
  ctx_name_salt = 0
  domFixture = document.getElementById 'spec-fixture'

  unloadRequire = (contextName)->
    delete window.require.s.contexts[contextName]

    if document.querySelectorAll
      scripts = document.querySelectorAll "[data-requirecontext='#{contextName}']"
      for s in scripts
        s.parentNode.removeChild s

    else
      scripts = document.getElementsByTagName "script"
      for s in scripts when s and (contextName is s.getAttribute 'data-requirecontext')
        s.parentNode.removeChild s

    return

  load: (name, req, load, config)->
    
    # Load Spec
    req [name], (Spec)-> load ->

      describe /.*\/specs\/(.*).spec$/.exec(name)[1], ->
        specRequire = null
        ctx = undefined

        # Run Spec
        Spec
          beforeEachRequire: (cb_mocks,deps,cb)->
            
            if arguments.length is 2
              cb = deps
              deps = cb_mocks

            beforeEach ->
              @domFixture = domFixture
              
              # Create a new require context for each spec describe/it
              specRequire = window.require.config
                context: ctxName = "specs#{ctx_name_salt++}"
                baseUrl: '../specs/'
                paths:
                  cell: '../src/cell'
                  dom: '../src/dom'
                  util: '../src/util'

              ctx = window.require.s.contexts[ctxName]

              if cb_mocks
                for mod_name, mod_obj of cb_mocks then do(mod_obj)->
                  mod_map = ctx.makeModuleMap mod_name, null, true
                  (ctx.registry[mod_name] = new ctx.Module mod_map).init [],
                    -> mod_obj
                    undefined
                    {enabled: true}
              
              dep_modules = undefined
              runs -> specRequire deps, (dms...)-> dep_modules = dms
              waitsFor -> dep_modules?
              runs -> cb.apply this, dep_modules
            
            afterEach ->
              domFixture.innerHTML = ''

              # Remove all modules loaded from context
              unloadRequire ctx.contextName if ctx
