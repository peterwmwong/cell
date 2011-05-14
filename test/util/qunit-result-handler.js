(function() {
  define(['./qunit-event-formatters.js'], function(eventFormatters) {
    var Count, curSuite, curSuiteCount, curTest, overallCount, sendTestEvent;
    Count = (function() {
      function Count() {
        this.counts = {};
        this.reset();
      }
      Count.prototype.passed = function() {
        return this.counts[true];
      };
      Count.prototype.failed = function() {
        return this.counts[false];
      };
      Count.prototype.count = function(isPass) {
        return ++this.counts[isPass];
      };
      Count.prototype.reset = function() {
        return this.counts[true] = this.counts[false] = 0;
      };
      return Count;
    })();
    overallCount = new Count();
    curSuiteCount = new Count();
    curSuite = void 0;
    curTest = void 0;
    sendTestEvent = function(event) {
      var logmsg;
      if (logmsg = eventFormatters[event.type](event)) {
        return typeof console !== "undefined" && console !== null ? console.log(logmsg) : void 0;
      }
      /*
            req = new XMLHttpRequest()
            req.open 'POST', '/result', true
            req.onreadystatechange = (res) ->
               if res.readyState == 4 and res.status != 200
                  console.log "Could not send test event event #{JSON.stringify(event)}"
            req.setRequestHeader 'Content-Type','application/json'
            req.send(JSON.stringify event)
            */
    };
    QUnit.begin = function() {
      return sendTestEvent({
        type: 'start'
      });
    };
    QUnit.done = function(_arg) {
      var failed, passed;
      failed = _arg.failed, passed = _arg.passed;
      return sendTestEvent({
        type: 'done',
        pass: passed,
        fail: failed
      });
    };
    QUnit.moduleStart = function(mod) {
      return sendTestEvent({
        type: 'suite.start',
        suite: (curSuite = mod)
      });
    };
    QUnit.moduleDone = function(mod) {
      return sendTestEvent({
        type: 'suite.done',
        pass: curSuiteCount.passed(),
        fail: curSuiteCount.failed(),
        suite: mod
      });
    };
    QUnit.testStart = function(test) {
      return sendTestEvent({
        type: 'test.start',
        suite: curSuite,
        test: (curTest = test)
      });
    };
    QUnit.testDone = function(_arg) {
      var failed, name, passed, total;
      name = _arg.name, failed = _arg.failed, passed = _arg.passed, total = _arg.total;
      return sendTestEvent({
        type: 'test.done',
        suite: curSuite,
        test: name,
        pass: passed,
        fail: failed
      });
    };
    return QUnit.log = function(_arg) {
      var actual, expected, message, result;
      result = _arg.result, message = _arg.message, actual = _arg.actual, expected = _arg.expected;
      if (!result) {
        try {
          throw new Error();
        } catch (_e) {}
      }
      return sendTestEvent({
        type: 'test.assert',
        suite: curSuite,
        test: curTest,
        assert: message,
        isPass: result,
        actual: JSON.stringify(actual),
        expected: JSON.stringify(expected)
      });
    };
  });
}).call(this);
