define
  load: (name, req, load, config)->
    
    # Load Spec
    req [name], (Spec)-> load ->
      ctx_name_salt = 0

      describe /.*\/specs\/cell_(.*).spec$/.exec(name)[1], ->
        specRequire = null
        ctx = undefined

        # Run Spec
        Spec
          beforeEachRequire: (deps,cb)->

            beforeEach ->
              # Remove all modules loaded from context
              $("[data-requirecontext='#{ctx.contextName}']").remove() if ctx

              # Create a new require context for each spec describe/it
              specRequire = window.require.config
                context: ctxName = "specs#{ctx_name_salt++}"
                baseUrl: '/specs/'
                paths:
                  cell: '../build/cell'
                  __: '../build/__'
              ctx = window.require.s.contexts[ctxName]
              
              dep_modules = undefined
              runs -> specRequire deps, (dms...)-> dep_modules = dms
              waitsFor -> dep_modules?
              runs -> cb.apply this, dep_modules
            