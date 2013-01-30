define ['jquery'], ($)->
  ctx_name_salt = 0

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
              # Create a new require context for each spec describe/it
              specRequire = window.require.config
                context: ctxName = "specs#{ctx_name_salt++}"
                baseUrl: '/specs/'
                paths:
                  cell: '../src/cell'
                  dom: '../src/dom'
                  utils: '../src/utils'

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
              # Remove all modules loaded from context
              if ctx
                $("[data-requirecontext='#{ctx.contextName}']").remove()
                delete window.require.s.contexts[ctx.contextName]