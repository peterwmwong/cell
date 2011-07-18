define -> (done)->
  html = (sel)=> @$(sel).html()

  equal html('.RenderCell > .booleanFalse'), ""
  equal html('.RenderCell > .undefined'), ""
  equal html('.RenderCell > .null'), ""

  equal html('.RenderCell > .number'), "5"
  equal html('.RenderCell > .numberZero'), "0"

  equal @$('.RenderCell > .list > li').length, 3
  equal html('.RenderCell > .list > .li0'), "10"
  equal html('.RenderCell > .list > .li1'), "20"
  equal html('.RenderCell > .list > .li2'), "30"

  equal html('.RenderCell > .node'), '<a href="www.google.com">blargo</a>'

  equal html('#anotherCellId.AnotherCell.anotherCellClass'),
    "id:anotherCellId class:anotherCellClass options.foo:bar collection:collection_val model:model_val"

  equal html('.RenderCell > .afterRender'), 'afterRender'

  done()
