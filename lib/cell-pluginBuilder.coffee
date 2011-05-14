define ->
  if not (typeof process != "undefined" and process.versions and !!process.versions.node)
    throw new Error '!!! require.js optimizer must run in Node.js !!!'

  fs = require.nodeRequire 'fs'
  path = require.nodeRequire 'path'

  get = (url, callback)->
    if path.existsSync(url) and fs.statSync(url).isFile()
      callback undefined, fs.readFileSync url, 'utf8'
    else
      callback "Couldn't find file #{url}"

  put = (url, contents)->
    fs.writeFileSync url, contents, 'utf8'

  outcssfile = undefined

  Cstack = []
  writeCount = 0

  write: (pName, mName, write)->
    ++writeCount
    if outcssfile? and Cstack.length > 0 and Cstack.length == writeCount
      allcss = ''
      preinstalls = []
      for {name,cssurl} in Cstack
        preinstalls.push name
        get cssurl, (err, contents)->
          if not err? and typeof contents == 'string'
            allcss += contents
      write """
            require(['cell'],function(p){
              p.__preinstalledCells__.push("#{preinstalls.join '","'}");
            });\n
            """
      put outcssfile, allcss
  
  load: do->
    moduleNameRegex = /(.*\/)?(.*)/
    (name, req, load, config)->
      if not outcssfile? and (match = /(.*)\.\w*/.exec config?.out) and match[1]
        outcssfile = match[1]+'.css'
      Cstack.push name: name, cssurl: req.toUrl "#{name}.css"
      req [name], load
