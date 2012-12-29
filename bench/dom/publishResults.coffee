define ->
  toBrowserScope: (results, testKey,sandboxid)->
    window._bTestResults = results

    log "=== Publishing to BrowserScope(testKey='#{testKey}',sandboxid='#{sandboxid}') ==="
    log window._bTestResults

    newScript = document.createElement 'script'
    firstScript = document.getElementsByTagName('script')[0]
    newScript.src = "http://www.browserscope.org/user/beacon/agt1YS1wcm9maWxlcnINCxIEVGVzdBiJkaITDA"
    newScript.src += "?sandboxid=#{sandboxid}" if sandboxid
    firstScript.parentNode.insertBefore newScript, firstScript
