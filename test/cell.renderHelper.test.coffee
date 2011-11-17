define [
  './util/helpers'
], ({nodeToHTML})->

  $R = cell::$R

  NODE = (tag)-> document.createElement tag
  nodeHTMLEquals = (node, expectedHTML)->
    ok node instanceof HTMLElement, "expected HTMLElement"
    equal nodeToHTML(node), expectedHTML, "expected #{expectedHTML}"

  "$R(<empty string, undefined, null, or function>)": ->
    for invalid in ['',undefined,null,(->)]
      equal $R(invalid), undefined, "#{invalid is '' and '""' or invalid} results to undefined"

  "$R(htmlTagString:<string>) HTML tag with attributes": ->
    nodeHTMLEquals (
      $R '<p id="myid" class="myclass" data-custom="myattr">'
    ), '<p id="myid" class="myclass" data-custom="myattr"></p>'

  "$R(htmlTagString:<string>, children...:<DOM Nodes, strings, numbers, or arrays>) with children": ->
    nodeHTMLEquals (
      $R '<div>',
        NODE 'span'
        'hello'
        for child in [NODE('table'), 'world', 5, [NODE('div')]]
          child
        0
        NODE 'a'
      ), "<div><span></span>hello<table></table>world5<div></div>0<a></a></div>"

  "$R(HAMLString:<string>) tag name, id, multiple classes": ->
    nodeHTMLEquals (
      $R 'p#myid.myclass.myclass2'
    ), '<p id="myid" class=" myclass myclass2"></p>'

  "$R(HAMLString:<string>, children...:<DOM Nodes, strings, numbers, or arrays>) with children": ->
    nodeHTMLEquals (
      $R 'p#myid.myclass.myclass2',
        NODE 'span'
        'hello'
        for child in [NODE('table'), 'world', 5, [NODE('div')]]
          child
        0
        NODE 'a'
    ), '<p id="myid" class=" myclass myclass2"><span></span>hello<table></table>world5<div></div>0<a></a></p>'

  "$R(HAMLString:<string>, children...:<NOT DOM NODES, STRINGS, NUMBERS, or ARRAYS>)": ->
    nodeHTMLEquals (
      $R 'p#myid.myclass.myclass2',
        undefined
        null
        (->)
    ), '<p id="myid" class=" myclass myclass2"></p>'

  "$R(HAMLString:<string>, attrMap:<object>) with attribute map": ->
    nodeHTMLEquals (
      $R 'p#myid.myclass.myclass2', 'data-custom':'myattr', 'data-custom2':'myattr2'
    ), '<p id="myid" data-custom="myattr" data-custom2="myattr2" class=" myclass myclass2"></p>'

  "$R(HAMLString:<string>, attrMap:<object>, children...:<DOM Nodes, strings, numbers, arrays>) with attribute map and children": ->
    nodeHTMLEquals (
      $R 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
        NODE 'span'
        'hello'
        for child in [NODE('table'), 'world', 5, [NODE('div')]]
          child
        0
        NODE 'a'
    ), '<p data-custom="myattr" data-custom2="myattr2"><span></span>hello<table></table>world5<div></div>0<a></a></p>'

  "$R(HAMLString:<string>, attrMap:<object>, children...:<NOT DOM NODES, STRINGS, NUMBERS, or ARRAYS>)": ->
    nodeHTMLEquals (
      $R 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
        undefined
        null
        (->)
    ), '<p data-custom="myattr" data-custom2="myattr2"></p>'

