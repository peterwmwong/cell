
  define(function() {
    var escapeHTML;
    escapeHTML = (function() {
      var div;
      div = document.createElement('div');
      return function(str) {
        div.innerHTML = '';
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
      };
    })();
    return {
      load: function(name, req, load, config) {
        return req([name], function(specs) {
          var spec, specName;
          name = name.replace(/\.test$/, '');
          module(name, {
            before: specs.$beforeEach,
            after: specs.$afterEach
          });
          for (specName in specs) {
            spec = specs[specName];
            if (!(specName !== '$beforeEach' && specName !== '$afterEach')) {
              continue;
            }
            specName = escapeHTML(specName);
            if (typeof spec === 'function') {
              test(specName, spec);
            } else if (typeof (spec != null ? spec.async : void 0) === 'function') {
              asyncTest(specName, spec.async);
            } else {
              test(specName, function() {
                return fail("Could not run test! Test is not sync (<function>) or async ({async:<function>})");
              });
            }
          }
          return load(true);
        });
      }
    };
  });
