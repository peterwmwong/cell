{exec} = require 'child_process'

module.exports = (testSpec,cb) ->
   exec "find ../ -type f -path \"../#{testSpec}Test.coffee\"", {cwd: __dirname}, (e,so,se)->
      cb so.trim().split("\n").map( (a)->a.slice(3,-7) )

