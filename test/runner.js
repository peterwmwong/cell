
  define(['require', './util/qunit-result-handler'], function(req) {
    var E, L, defer, item, kv, load_testdoc, runTests, tests;
    L = function(msg) {
      return typeof console !== "undefined" && console !== null ? console.log(msg) : void 0;
    };
    E = function(msg) {
      if (typeof console !== "undefined" && console !== null) {
        console.error((msg = msg.stack || msg));
      }
      ok(false, msg);
      return start();
    };
    defer = function(t, f) {
      return setTimeout(f, t);
    };
    load_testdoc = function(url, parentNode, done) {
      var iframe;
      iframe = document.createElement('iframe');
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.src = url;
      iframe.onload = function() {
        var checkDoDone, idoc;
        idoc = iframe.contentDocument;
        if (!idoc.title) {
          return done(new Error("Could not load test! (" + test + ")"));
        } else {
          checkDoDone = function() {
            if (idoc.readyState === 'complete') {
              defer(10, function() {
                return done(void 0, idoc, iframe);
              });
              return true;
            }
          };
          if (!checkDoDone()) return idoc.onreadystatechange = checkDoDone;
        }
      };
      return parentNode.appendChild(iframe);
    };
    runTests = function(_arg) {
      var tests, tu, _i, _len, _results;
      tests = _arg.tests;
      if (tests.length === 0) {
        return E("No test specified in URL (ex. 'runner.html?test=simple')");
      } else {
        _results = [];
        for (_i = 0, _len = tests.length; _i < _len; _i++) {
          tu = tests[_i];
          _results.push((function(tu) {
            return asyncTest(tu, function() {
              var testdocurl;
              return load_testdoc((testdocurl = "./at/" + tu + "/index.html"), document.body, function(err, testdoc, iframe) {
                if (err) {
                  E(new Error("Error loading test document: " + testdocurl));
                }
                return req(["./at/" + tu + "/test.js"], function(thetest) {
                  return defer(100, function() {
                    try {
                      return thetest.call({
                        $: (function(sel) {
                          return $(sel, testdoc);
                        })
                      }, function() {
                        if (tests.length > 1) $(iframe).remove();
                        return start();
                      });
                    } catch (e) {
                      return E(e);
                    }
                  });
                });
              });
            });
          })(tu));
        }
        return _results;
      }
    };
    tests = (function() {
      var _i, _len, _ref, _results;
      _ref = window.location.search.slice(1).split('&');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if ((kv = item.split('=')) && kv[0] === 'test' && kv[1]) {
          _results.push(decodeURIComponent(kv[1]));
        }
      }
      return _results;
    })();
    if (tests.length === 0) {
      return req(["./at/_alltests.js"], runTests);
    } else {
      return runTests({
        tests: tests
      });
    }
  });
