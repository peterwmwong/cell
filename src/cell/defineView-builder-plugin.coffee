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
    return

  put = (url, contents)->
    fs.writeFileSync url, contents, 'utf8'
    return

  outcssfile = undefined
  configBaseUrl = undefined

  Cstack = []
  writeCount = 0

  quoteRegex = /"|'/
  absUrlRegex = /^(([A-z]+:\/\/)|\/)/

  repathCSSRelativeURL: repathCSSRelativeURL = (cssContents, cssFilePath, baseUrl)->
    cssDir = path.dirname cssFilePath

    # Find all url references
    cssContents.replace /:[ \t]*url\((.+?)\)/g, (match, urlString)->
      urlString = urlString.trim()

      # if quoted
      if quoteRegex.test(urlString.charAt(0)) and quoteRegex.test(urlString.charAt(urlString.length - 1))
        urlString = urlString.slice 1, urlString.length-1

      if absUrlRegex.test urlString
        match
      else
        ": url('#{path.relative baseUrl, (path.join cssDir, urlString)}')"


  write: (pName, mName, write)->
    ++writeCount
    if outcssfile? and Cstack.length > 0 and Cstack.length is writeCount
      allcss = ''
      preinstalls = {}

      for {name,cssurl} in Cstack
        preinstalls[name] = 1
        get cssurl, (err, contents)->
          if not err? and typeof contents is 'string'
           allcss += repathCSSRelativeURL contents, cssurl, configBaseUrl
          return

      write ";window.__installedViews = #{JSON.stringify preinstalls};"
      put outcssfile, allcss
    return
  
  load: do->
    moduleNameRegex = /(.*\/)?(.*)/
    (name, req, onLoad, config)->
      configBaseUrl = config.baseUrl

      if not outcssfile? and (match = /(.*)\.\w*/.exec config?.out) and match[1]
        outcssfile = match[1]+'.css'
      Cstack.push name: name, cssurl: req.toUrl "#{name}.css"
      onLoad()
      req ['cell/View']
      req [name]
      return
