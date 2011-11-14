
  define({
    load: function(name, req, load, config) {
      return req([name], function(specs) {
        var spec, specName;
        module(name, {
          before: specs.$beforeEach,
          after: specs.$afterEach
        });
        for (specName in specs) {
          spec = specs[specName];
          if (specName !== '$beforeEach' && specName !== '$afterEach') {
            asyncTest(specName, spec);
          }
        }
        return load(true);
      });
    }
  });
