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
          beforeEachRequire: (prereqDeps,deps,cb)->
            if arguments.length is 2
              cb = deps
              deps = prereqDeps
              prereqDeps = undefined

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
              
              if prereqDeps
                prereqdep_modules = undefined
                runs -> specRequire prereqDeps, (dms...)-> prereqdep_modules = dms
                waitsFor -> prereqdep_modules?

              dep_modules = undefined
              runs -> specRequire deps, (dms...)-> dep_modules = dms
              waitsFor -> dep_modules?
              runs -> cb.apply this, dep_modules
            
            afterEach ->
              domFixture.innerHTML = ''

              # Remove all modules loaded from context
              unloadRequire ctx.contextName if ctx
