define
  load: (name, req, load, config)->
    req [name], (specs)->
      module name, before:specs.$beforeEach, after:specs.$afterEach
      for specName, spec of specs when specName not in ['$beforeEach', '$afterEach']
        asyncTest specName, spec
      load true