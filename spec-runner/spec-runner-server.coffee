{resolve} = require 'path'
connect = require 'connect'
http = require 'http'

if process.argv.length != 3 then console.log "[dir]"
else
  root_path = resolve process.argv[2]
  app = connect()
  app.use(plugin) for plugin in [
    connect.favicon()
    connect.compress()
    connect.static root_path, maxAge: 1, hidden: true
  ]
  http.createServer(app).listen port = 8080
  console.log "serving #{root_path} on port #{port}"