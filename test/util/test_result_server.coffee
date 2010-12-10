express = require 'express' #TODO Figure out why deps/test/express doesn't work
http = require 'http'
{inspect} = require 'util'
{stat,readFile} = require 'fs'
url = require 'url'
{EventEmitter} = require 'events'
path = require 'path'
coffee = require 'coffee-script'

compileCoffeeFile = (log, file, cb) ->
   path.exists file, (exists) ->
      return cb 404 if not exists
      
      log "Compiling Coffee #{file}"
      readFile file, (err, src) ->
         return cb err if err
         
         compiled_src = undefined
         try
            compiled_src = coffee.compile src.toString()
         catch err2
            log "!!! FAILED to compiling Coffee #{filePath}, err=#{inspect err2}"
            err = err2
         finally
            cb(err,compiled_src)

exports.create = ({baseDir,port,log}) ->
   log ?= ->
   app = express.createServer()
   emitter = new EventEmitter()

   # Verify Base Directory for tests is valid
   stat baseDir, (err, stats) ->
      throw err if err
      throw new Error("#{baseDir} is not a Directory") if !stats.isDirectory

      app.configure ->
         # Server up...
         #  - dependencies
         app.use '/deps', express.staticProvider(__dirname + '/../../deps')
         #  - Cell src
         app.use '/src', express.staticProvider(__dirname + '/../../src')
         #  - tests
         app.use '/test', express.staticProvider(baseDir)

         # JSON body decoder
         # TODO why doesn't express.bodyDecoder() work
         app.use (req,res,next) ->
            if req.headers['content-type'] == 'application/json'
               data = ''
               req.setEncoding 'utf8'
               req.addListener 'data', (chunk) -> data+=chunk
               req.addListener 'end', () ->
                  req.rawBody = data
                  try
                     req.body = JSON.parse data
                  catch err
                     return next(err)
                  next()
            else
               next()

      # Handle Coffee compile fallback
      #   If staticProvider (above) couldn't find the js file,
      #   try to compile and serve a coffee file with the same name
      app.get '/test/**/*.js', (req,res,next) ->
         # Slice off '/test' and '.js'
         compileCoffeeFile log, baseDir+req.url.slice(5,-2)+'coffee', (err,compiled_src) ->
            if err?
               res.send "Couldn't Coffee compile err=#{err}", (if err==404 then 404 else 500)
            else
               res.send compiled_src, {'Content-Type':'text/javascript'}, 200

      # Handle Test Events 
      app.post '/result', (req,res) ->
         emitter.emit req.body.type, req.body
         log "Result: event= #{inspect req.body}"
         res.send 'OK'

      app.listen port

   log "Base Dir: #{baseDir}"
   log "Running on #{port}"

   emitter.close = app.close
   return emitter

