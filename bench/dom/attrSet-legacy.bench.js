// Generated by CoffeeScript 1.4.0

define(function(require) {
  return require('bench-dom')({
    dom_html: '<select multiple name="samp"></select>',
    baseline: "dom.attr('name', 'newName');",
    now: "dom.attrSet('name', 'newName');"
  });
});