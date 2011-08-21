define
  render: (_)-> [
    _ cell.extend tag: '<span>', 'TagString'
    _ cell.extend tag: '<p class="class" data-custom="customValue">', 'TagStringWithAttrs'
    _ cell.extend tag: (-> '<span>'), 'TagFunc'
    _ cell.extend tag: (-> '<p class="class2" data-custom2="customValue2">'), 'TagFuncWithAttrs'
  ]