define -> (done)->
  exists =
    (sel)=> ok @$(".RenderCell > #{sel}").length is 1

  exists 'span.TagString'
  exists 'p.class.TagStringWithAttrs[data-custom="customValue"]'
  exists 'span.TagFunc'
  exists 'p.class2.TagFuncWithAttrs[data-custom2="customValue2"]'

  done()