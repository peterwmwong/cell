{exec} = require 'child_process'

module.exports = ({spec,dir},cb) ->
   exec "find #{dir} -type f -path \"#{dir}/#{spec}\"",
      (e,so,se)->
         cb so.trim()
              .split('\n')
              .filter( (a)->a.trim().length>0 )
              .map( (a)->a.slice( dir.length, a.lastIndexOf('.')-a.length ) )

