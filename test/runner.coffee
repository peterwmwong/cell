define ['require','./util/qunit-result-handler'],(req)->
  L = (msg)-> console?.log msg
  E = (msg)->
    console?.error (msg = msg.stack or msg)
    ok false, msg
    start()
  defer = (t,f)->setTimeout f,t

  load_testdoc = (url,parentNode,done)->
    iframe = document.createElement 'iframe'
    iframe.width = "100%"
    iframe.height = "100%"
    iframe.src = url
    iframe.onload = ->
      idoc = iframe.contentDocument

      # Lame check for whether {url} loaded in iframe or not
      if not idoc.title
        done new Error "Could not load test! (#{test})"
      else
        checkDoDone = ->
          if idoc.readyState == 'complete'
            defer 10, -> done undefined, idoc, iframe
            true

        if not checkDoDone()
          idoc.onreadystatechange = checkDoDone

    parentNode.appendChild iframe

  runTests = ({tests})->
    if tests.length is 0 then E "No test specified in URL (ex. 'runner.html?test=simple')"
    else
      for tu in tests then do(tu)-> asyncTest tu, ->
        # Load test/index.html
        load_testdoc (testdocurl = "./at/#{tu}/index.html"), document.body, (err,testdoc,iframe)->

          if err then E new Error "Error loading test document: #{testdocurl}"

          # Load test/test.js
          req ["./at/#{tu}/test.js"], (thetest)-> defer 100,->
            try
              thetest.call $:((sel)-> $(sel,testdoc)), ->
                # Only remove the iframe, if we're running more then
                # one test so it doesn't get in the way
                if tests.length > 1 then $(iframe).remove()
                start()
            catch e
              E e

  # Parse comma delimited test suite names from url 
  # ex. ?test={urlToTest}
  tests =
    for item in window.location.search.slice(1).split('&') when (kv=item.split('=')) and kv[0]=='test' and kv[1]
      decodeURIComponent kv[1]

  # If no tests specified in URL, use list of all tests (_alltests.js)
  if tests.length is 0
    req ["./at/_alltests.js"], runTests
  else
    runTests tests:tests
