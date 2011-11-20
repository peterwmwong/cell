resolve = require('path').resolve
server = (connect = require 'connect')()

if process.argv.length != 3 then console.log "[dir]"
else
  path = resolve process.argv[2]

  server.use use for use in [
    connect.favicon()
    connect.static path, maxAge: 1, hidden: true
  ]

  server.listen 8080
  console.log "'serving #{path} on #{server.address().port}"