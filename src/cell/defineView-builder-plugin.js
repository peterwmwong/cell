// Generated by CoffeeScript 1.4.0

define(function() {
  var Cstack, fs, get, outcssfile, path, put, writeCount;
  if (!(typeof process !== "undefined" && process.versions && !!process.versions.node)) {
    throw new Error('!!! require.js optimizer must run in Node.js !!!');
  }
  fs = require.nodeRequire('fs');
  path = require.nodeRequire('path');
  get = function(url, callback) {
    if (path.existsSync(url) && fs.statSync(url).isFile()) {
      return callback(void 0, fs.readFileSync(url, 'utf8'));
    } else {
      return callback("Couldn't find file " + url);
    }
  };
  put = function(url, contents) {
    return fs.writeFileSync(url, contents, 'utf8');
  };
  outcssfile = void 0;
  Cstack = [];
  writeCount = 0;
  return {
    write: function(pName, mName, write) {
      var allcss, cssurl, name, preinstalls, _i, _len, _ref;
      ++writeCount;
      if ((outcssfile != null) && Cstack.length > 0 && Cstack.length === writeCount) {
        allcss = '';
        preinstalls = {};
        console.log(Cstack);
        for (_i = 0, _len = Cstack.length; _i < _len; _i++) {
          _ref = Cstack[_i], name = _ref.name, cssurl = _ref.cssurl;
          preinstalls[name] = 1;
          get(cssurl, function(err, contents) {
            if (!(err != null) && typeof contents === 'string') {
              return allcss += contents;
            }
          });
        }
        write("require(['cell/defineView'],function(p){\n  p._installed = " + (JSON.stringify(preinstalls)) + ";\n});\n");
        return put(outcssfile, allcss);
      }
    },
    load: (function() {
      var moduleNameRegex;
      moduleNameRegex = /(.*\/)?(.*)/;
      return function(name, req, onLoad, config) {
        var match;
        if (!(outcssfile != null) && (match = /(.*)\.\w*/.exec(config != null ? config.out : void 0)) && match[1]) {
          outcssfile = match[1] + '.css';
        }
        Cstack.push({
          name: name,
          cssurl: req.toUrl("" + name + ".css")
        });
        onLoad();
        req(['cell/View']);
        return req([name]);
      };
    })()
  };
});