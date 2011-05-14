(function() {
  var app, express;
  app = (express = require('express')).createServer();
  app.use('/', express.static("" + __dirname + "/../../"));
  app.listen(8080);
}).call(this);
