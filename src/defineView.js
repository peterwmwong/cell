// Generated by CoffeeScript 1.4.0

define(['cell/View'], function(View) {
  var module;
  module = {
    pluginBuilder: 'cell/defineView-builder-plugin',
    load: function(name, req, load, config) {
      var el;
      if (!(module._installed || (module._installed = {}))[name]) {
        module._installed[name] = true;
        el = document.createElement('link');
        el.href = req.toUrl(name + ".css");
        el.rel = 'stylesheet';
        el.type = 'text/css';
        document.head.appendChild(el);
      }
      load(function(proto) {
        proto || (proto = {});
        proto.className = proto._cellName = /(.*\/)?(.*)$/.exec(name)[2];
        return View.extend(proto);
      });
    }
  };
  return module;
});