// Generated by CoffeeScript 1.6.1

define(function(require) {
  return require('bench-dom')({
    dom_html: '<select multiple name="samp"></select>',
    baseline: "dom.attr('name', 'newName');",
    now: "dom.attrSet('name', 'newName');"
  });
});
