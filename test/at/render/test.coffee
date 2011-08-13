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
  equal @$('.RenderCell > .htmlNode.anotherClass').css('background-color'), 'rgb(255, 0, 0)'
  equal @$('.RenderCell > .htmlNode.anotherClass').attr('data-custom'), 'something'
  
  equal html('#selID1'), 'Selector id'

  equal @$('#ignoredID1')[0], undefined
  equal html('#optionID1.optionClass1'), 'Selector id, option id, option class, option data-custom attribute'

  equal @$('#ignoredID2')[0], undefined
  equal html('#selID2'), 'Multiple Selector ids'

  equal html('.selClass1.selClass2'), 'Multiple Selector classes'
  equal html('#optionID2.selClass3.optionClass2'), 'Selector class, option id, option class, option data-custom attribute'

  equal html('#anotherCellId.AnotherCell.anotherCellClass'),
    "id:anotherCellId class:anotherCellClass options.foo:bar collection:collection_val model:model_val"

  equal html('.afterRender'), 'afterRender'

  done()
