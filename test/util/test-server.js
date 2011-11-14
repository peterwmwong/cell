(function() {
  var app, dir, express;

  app = (express = require('express')).createServer();

  app.use('/', express.static(dir = "" + __dirname + "/../../"));

  console.log("Test Server: " + dir);

  app.listen(8080);

}).call(this);
