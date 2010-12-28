{exec} = require 'child_process'

module.exports = ({spec,dir},cb) ->
   exec "find #{dir} -type f -path \"#{dir}/#{spec}Test.coffee\"",
      (e,so,se)->
         cb so.trim().split('\n')
              .filter( (a)->a.trim().length>0 )
              .map( (a)->a.slice(dir.length,-7) )

