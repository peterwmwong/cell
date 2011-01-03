define ->
   (url,parentNode,done)->
      iframe = document.createElement('iframe')
      iframe.width = "100%"
      iframe.height = "100%"
      iframe.sandbox = 'allow-same-origin allow-scripts'
      iframe.src = url
      iframe.onload = ->
         idoc = iframe.contentDocument

         # Lame check for whether {url} loaded in iframe or not
         unless idoc.title
            done undefined, new Error "Could not load test! (#{test})"
         else
            checkDoDone = ->
               if idoc.readyState == 'complete'
                  setTimeout (-> done idoc), 100
                  true

            if not checkDoDone()
               idoc.onreadystatechange = checkDoDone

      parentNode.appendChild iframe
