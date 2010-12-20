define [], ->
   # Determine appropriate XHR impl
   createXhr = (->
      if XMLHttpRequest?
         return -> new XMLHttpRequest()
      else
         for progId in ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0']
            try
               new ActiveXObject progId
               return -> new ActiveXObject progId
            )()

   fetchText = (url,cb)->
      xhr = createXhr()
      xhr.open 'GET', url, true
      xhr.onreadystatechange = (evt)->
         if xhr.readyState == 4
            cb xhr.responseText.trim(), xhr.status
      xhr.send null

   # EXPORT
   load: (name, require, done)->
      fetchText name, (text,status)->
         if status >= 400
            done undefined, text
         else
            done text

