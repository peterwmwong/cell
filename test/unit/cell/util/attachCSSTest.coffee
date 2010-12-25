define ->
   defer = (t,f)-> setTimeout f,t

   $testObj: 'cell/util/attachCSS'

   $beforeTest: (require,done)->
      if window then done()
      else console.log "!!! BROWSER TEST !!!"

   $afterTest: (done)->
      # Clean up all style tags added by tests
      nodes = document.head.querySelectorAll('style#testcssid')
      for n in Array.prototype.slice.call(nodes)
         try n.parentNode.removeChild n
      done()

   'attachCSSTest(name,css,done): should attach <style id="{name}">{css}</style> tag to head': (require,get,done)-> get (attachCSS)->
      attached = false
      attachCSS 'testcssid', '.test {}', ->
         attached = true
         nodes = document.head.querySelectorAll('style#testcssid')
         equal nodes.length, 1, 'Only one <style> should be attached to head'
         equal nodes[0].innerHTML, '.test {}', 'Should attach CSS in <style> tag'
         done()

      defer 100, ->
         unless attached
            ok false, '<style> tag should have been attached to <head>'
            done()

