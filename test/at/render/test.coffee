define -> (done)->
  html = (sel)=> @$(".RenderCell > #{sel}").html()

  equal html('.booleanFalse'), ""
  equal html('.undefined'), ""
  equal html('.null'), ""

  equal html('.number'), "5"
  equal html('.numberZero'), "0"

  equal @$('.RenderCell > .list > li').length, 3
  equal html('.list > .li0'), "10"
  equal html('.list > .li1'), "20"
  equal html('.list > .li2'), "30"

  equal html('.htmlNode.anotherClass'), '<a href="http://www.yahoo.com">foobar</a>'
  equal @$('.RenderCell > .htmlNode.anotherClass').css('color'), 'rgb(255, 0, 0)'
  
  equal html('.node'), '<a href="http://www.google.com">blargo</a>'

  equal html('#anotherCellId.AnotherCell.anotherCellClass'),
    "id:anotherCellId class:anotherCellClass options.foo:bar collection:collection_val model:model_val"

  equal html('.afterRender'), 'afterRender'

  done()
