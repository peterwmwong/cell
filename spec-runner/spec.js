// Generated by CoffeeScript 1.4.0
var __slice = [].slice;

define(['jquery'], function($) {
  var ctx_name_salt;
  ctx_name_salt = 0;
  return {
    load: function(name, req, load, config) {
      return req([name], function(Spec) {
        return load(function() {
          return describe(/.*\/specs\/((backbone|cell|jquery)_)?(.*).spec$/.exec(name)[3], function() {
            var ctx, specRequire;
            specRequire = null;
            ctx = void 0;
            return Spec({
              beforeEachRequire: function(deps, cb) {
                beforeEach(function() {
                  var ctxName, dep_modules;
                  specRequire = window.require.config({
                    context: ctxName = "specs" + (ctx_name_salt++),
                    baseUrl: '/specs/',
                    paths: {
                      cell: '../src/cell',
                      dom: '../src/dom',
                      utils: '../src/utils'
                    }
                  });
                  ctx = window.require.s.contexts[ctxName];
                  dep_modules = void 0;
                  runs(function() {
                    return specRequire(deps, function() {
                      var dms;
                      dms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                      return dep_modules = dms;
                    });
                  });
                  waitsFor(function() {
                    return dep_modules != null;
                  });
                  return runs(function() {
                    return cb.apply(this, dep_modules);
                  });
                });
                return afterEach(function() {
                  if (ctx) {
                    $("[data-requirecontext='" + ctx.contextName + "']").remove();
                    return delete window.require.s.contexts[ctx.contextName];
                  }
                });
              }
            });
          });
        });
      });
    }
  };
});
