define [
  './util/helpers'
], ({nodeHTMLEquals})->

  NODE = (tag)-> document.createElement tag
  _ = cell::_

  "_(<empty string, undefined, null, false, or function>)": ->
    for invalid in ['',undefined,null, (->)]
      equal _(invalid), undefined, "#{invalid is '' and '""' or invalid} results to undefined"

  "_(htmlTagString:<string>) HTML tag with attributes": ->
    nodeHTMLEquals (
      _ '<p id="myid" class="myclass" data-custom="myattr">'
    ), '<p class="myclass" data-custom="myattr" id="myid"></p>'

  "_(htmlTagString:<string>, children...:<DOM Nodes, cell, strings, numbers, or arrays>) with children": ->
    nodeHTMLEquals (
      _ '<div>',
        NODE 'span'
        'hello'
        [NODE('table'), 'world', 5, [NODE('div')]]
        0
        NODE 'a'
      ), "<div><span></span>hello<table></table>world5<div></div>0<a></a></div>"

  "_(HAMLString:<string>) tag name, id, multiple classes": ->
    nodeHTMLEquals (
      _ 'p#myid.myclass.myclass2'
    ), '<p class="myclass myclass2" id="myid"></p>'

  "_(HAMLString:<string>, text:<string>)": ->
    nodeHTMLEquals (
      _ 'p#myid.myclass.myclass2', 'blargo'
    ), '<p class="myclass myclass2" id="myid">blargo</p>'

  "_(HAMLString:<string>, num:<number>)": ->
    nodeHTMLEquals (
      _ 'p#myid.myclass.myclass2', 5
    ), '<p class="myclass myclass2" id="myid">5</p>'

  "_(HAMLString:<string>, num:<number == 0>)": ->
    nodeHTMLEquals (
      _ 'p#myid.myclass.myclass2', 0
    ), '<p class="myclass myclass2" id="myid">0</p>'

  "_(HAMLString:<string>, node:<DOM Node>)": ->
    nodeHTMLEquals (
      _ 'p#myid.myclass.myclass2', NODE 'span'
    ), '<p class="myclass myclass2" id="myid"><span></span></p>'

  "_(HAMLString:<string>, children:<array of strings>)": ->
    nodeHTMLEquals (
      _ 'p#myid.myclass.myclass2', ['blargo']
    ), '<p class="myclass myclass2" id="myid">blargo</p>'

  "_(HAMLString:<string>, children...:<DOM Nodes, strings, numbers, or arrays>) with children": ->
    nodeHTMLEquals (
      _ 'p#myid.myclass.myclass2',
        NODE 'span'
        'hello'
        [NODE('table'), 'world', 5, [NODE('div')]]
        0
        NODE 'a'
        jQuery('<span class="jQueryObj"></span><span class="jQueryObjDeux"></span>')
    ), '<p class="myclass myclass2" id="myid"><span></span>hello<table></table>world5<div></div>0<a></a><span class="jQueryObj"></span><span class="jQueryObjDeux"></span></p>'

  "_(HAMLString:<string>, children...:<NOT DOM NODES, STRINGS, NUMBERS, or ARRAYS>)": ->
    nodeHTMLEquals (
      _ 'p#myid.myclass.myclass2',
        undefined
        null
        (->)
    ), '<p class="myclass myclass2" id="myid"></p>'

  "_(HAMLString:<string>, attrMap:<object>) with attribute map": ->
    nodeHTMLEquals (
      _ 'p#myid.myclass.myclass2', class:'myclass3', 'data-custom':'myattr', 'data-custom2':'myattr2'
    ), '<p class="myclass3 myclass myclass2" data-custom="myattr" data-custom2="myattr2" id="myid"></p>'

  "_(HAMLString:<string>, attrMap:<object>, children...:<DOM Nodes, strings, numbers, or arrays>) with attribute map and children": ->
    nodeHTMLEquals (
      _ 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
        NODE 'span'
        'hello'
        [NODE('table'), 'world', 5, [NODE('div')]]
        0
        NODE 'a'
    ), '<p data-custom="myattr" data-custom2="myattr2"><span></span>hello<table></table>world5<div></div>0<a></a></p>'

  "_(HAMLString:<string>, attrMap:<object>, children...:<NOT DOM NODES, STRINGS, NUMBERS, or ARRAYS>)": ->
    nodeHTMLEquals (
      _ 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
        undefined
        null
        (->)
    ), '<p data-custom="myattr" data-custom2="myattr2"></p>'

  "_(cell:<cell>, options:<object>)": ->
    TestCell = cell.extend render: -> [NODE @options.tagName]
    nodeHTMLEquals (
      _ TestCell, tagName: 'span'
    ), '<div><span></span></div>'

  "_(cell:<cell>)": ->
    TestCell = cell.extend render: -> [NODE 'a']
    nodeHTMLEquals (
      _ TestCell
    ), '<div><a></a></div>'

  "_(cell:<cell>, HAMLString:<string>, options:<object>)": ->
    TestCell = cell.extend render: -> [NODE @options.tagName]
    nodeHTMLEquals (
      _ TestCell, '#myid.myclass.myclass2', tagName: 'span'
    ), '<div class="myclass myclass2" id="myid"><span></span></div>'

  "_(cell:<cell>, HAMLString:<string>)": ->
    TestCell = cell.extend render: -> [NODE 'a']
    nodeHTMLEquals (
      _ TestCell, '#myid.myclass.myclass2'
    ), '<div class="myclass myclass2" id="myid"><a></a></div>'
