// Generated by CoffeeScript 1.4.0
var app, connect, http, plugin, port, resolve, root_path, _i, _len, _ref;

resolve = require('path').resolve;

connect = require('connect');

http = require('http');

if (process.argv.length !== 3) {
  console.log("[dir]");
} else {
  root_path = resolve(process.argv[2]);
  app = connect();
  _ref = [
    connect.favicon(), connect.compress(), connect["static"](root_path, {
      maxAge: 1,
      hidden: true
    })
  ];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    plugin = _ref[_i];
    app.use(plugin);
  }
  http.createServer(app).listen(port = 8080);
  console.log("serving " + root_path + " on port " + port);
}
