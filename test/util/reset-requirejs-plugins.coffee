define -> ->
   # Make requirejs forget about the plugin, so a new plugin 
   # context is created for each test
   for cbArray in require.s.plugins.callbacks
      cbArray.splice 0, cbArray.length
   delete require.s.plugins.defined['cell']
