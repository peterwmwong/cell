// Generated by CoffeeScript 1.4.0

define(function() {
  return {
    toBrowserScope: function(results, testKey, sandboxid) {
      var firstScript, newScript;
      window._bTestResults = results;
      log("=== Publishing to BrowserScope(testKey='" + testKey + "',sandboxid='" + sandboxid + "') ===");
      log(window._bTestResults);
      newScript = document.createElement('script');
      firstScript = document.getElementsByTagName('script')[0];
      newScript.src = "http://www.browserscope.org/user/beacon/agt1YS1wcm9maWxlcnINCxIEVGVzdBiJkaITDA";
      if (sandboxid) {
        newScript.src += "?sandboxid=" + sandboxid;
      }
      return firstScript.parentNode.insertBefore(newScript, firstScript);
    }
  };
});
