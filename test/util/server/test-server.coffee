express = require '../../../deps/test/express'
{inspect} = require 'util'
{readFile} = require 'fs'
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


exports.create = ({srcDir,depsDir,testsDir,mocksDir,utilDir,port,log}) ->
   log ?= ->
   app = express.createServer()
   emitter = new EventEmitter()
   handleCoffeeCompile = (path,req,res,next)->
      compileCoffeeFile log, path, (err,compiled_src) ->
         if err?
            res.send "Couldn't Coffee compile err=#{err}", (if err==404 then 404 else 500)
         else
            res.send compiled_src, {'Content-Type':'text/javascript'}, 200

   app.configure ->
      app.use '/deps', express.staticProvider(depsDir)
      app.use '/src',  express.staticProvider(srcDir)
      app.use '/tests',express.staticProvider(testsDir)
      app.use '/mocks',express.staticProvider(mocksDir)
      app.use '/util',express.staticProvider(utilDir)
      app.use(express.bodyDecoder())

   # Handle Coffee compile fallback
   #   If staticProvider (above) couldn't find the js file,
   #   try to compile and serve a coffee file with the same name
   app.get '/tests/*.js', (req,res,next)->
      handleCoffeeCompile testsDir+req.url.slice(6,-2)+'coffee', req, res, next

   app.get '/util/*.js', (req,res,next)->
      handleCoffeeCompile utilDir+req.url.slice(5,-2)+'coffee', req, res, next

   app.get '/src/*.js', (req,res,next)->
      handleCoffeeCompile srcDir+req.url.slice(4,-2)+'coffee', req, res, next

   # Handle Test Events 
   app.post '/result', (req,res) ->
      res.send 'OK'
      emitter.emit req.body.type, req.body

   app.listen port

   log "Tests  Dir: #{testsDir}"
   log "Source Dir: #{srcDir}"
   log "Deps   Dir: #{depsDir}"
   log "Mocks  Dir: #{mocksDir}"
   log "Running on #{port}"

   emitter.close = app.close
   return emitter

