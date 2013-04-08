define ->
  SIMPLE_HEADERS = ["Cache-Control", "Content-Language", "Content-Type", "Expires", "Last-Modified", "Pragma"]
  FILE_URL_MATCH = /^file:\/\/(\w+:{0,1}\w*@)?(\{?[\w\.-]*\}?)(:([0-9]+))?(\/[^\?#]*)?(\?([^#]*))?(#(.*))?$/

  http = (opts,callback)->
    completeRequest = (status, response) ->
      if FILE_URL_MATCH.test opts.url
        status =
          if response then 200
          else 404
      else if status is 1223
        status = 204

      callback status, response, (200 <= status < 300)

    xhr = new http.XHR()
    xhr.open opts.method, opts.url, true

    for key,value of opts.headers when value
      xhr.setRequestHeader key, value

    status = undefined
    xhr.onreadystatechange = ->
      if xhr.readyState is 4
        completeRequest (status or xhr.status),
          if xhr.responseType then xhr.response else xhr.responseText

    xhr.withCredentials = true if opts.withCredentials
    xhr.responseType = opts.responseType if opts.responseType
    xhr.send opts.data or ""
    if opts.timeout > 0
      setTimeout (->
        status = -1
        xhr.abort()
      ), opts.timeout

  http.XHR = window.XMLHttpRequest or do->
    func = -> new ActiveXObject ActiveXObjectId
    ids = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP"]
    while ActiveXObjectId = ids.pop()
      try
        func()
        return func
    throw new Error "XMLHttpRequest not supported"

  http