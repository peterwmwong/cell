define ->
  ctx_name_salt = 0

  load: (name, req, load, config)->
    
    # Load Spec
    req [name], (Spec)-> load ->

      describe /.*\/specs\/(backbone|cell|jquery)_(.*).spec$/.exec(name)[2], ->
        specRequire = null
        ctx = undefined

        # Run Spec
        Spec
          beforeEachRequire: (deps,cb)->

            beforeEach ->
              # Create a new require context for each spec describe/it
              specRequire = window.require.config
                context: ctxName = "specs#{ctx_name_salt++}"
                baseUrl: '/specs/'
                paths:
                  cell: '../build/cell'
                  __: '../build/__'
                  ref: '../build/ref'
                  jquery: '../support/jquery'
                  underscore: '../node_modules/underscore/underscore'
                  backbone: '../support/backbone.master'
                shim:
                  underscore:
                    deps: ["jquery"]
                    exports: '_'
                  backbone:
                    deps: ["underscore", "jquery"]
                    exports: "Backbone"

              ctx = window.require.s.contexts[ctxName]
              
              dep_modules = undefined
              runs -> specRequire deps, (dms...)-> dep_modules = dms
              waitsFor -> dep_modules?
              runs -> cb.apply this, dep_modules
            
            afterEach ->
              # Remove all modules loaded from context
              if ctx
                $("[data-requirecontext='#{ctx.contextName}']").remove()
                delete window.require.s.contexts[ctx.contextName]