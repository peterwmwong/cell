define [
  './util/helpers'
], ({nodeHTMLEquals})->

  testTag = (tag, expectedElHTML)->
    NewCell = cell.extend {tag}
    node = (instance = new NewCell()).el
    nodeHTMLEquals node, expectedElHTML
    instance

  'undefined, null, <array> or <number> defaults to <div>': ->
    for invalid in [undefined, null, [], 5]
      testTag invalid, "<div></div>"

  'Bad Tag String defaults to <div>': ->
    testTag 'blarg', '<div></div>'

  'Tag String <p data-custom="myAttr" class="myClass" id="myId">': ->
    testTag '<p data-custom="myAttr" class="myClass" id="myId">',
      '<p class="myClass" data-custom="myAttr" id="myId"></p>'

  'Tag Function (-> <p data-custom="myAttr" class="myClass" id="myId">)': ->
    tag_spy = sinon.spy -> '<p data-custom="myAttr" class="myClass" id="myId">'
    cell_inst = testTag tag_spy, '<p class="myClass" data-custom="myAttr" id="myId"></p>'
    ok tag_spy.calledOnce, 'called once'
    ok tag_spy.calledOn(cell_inst) , 'Called with "this" set to cell instance'

  'Bad Tag Function': ->
    testTag (-> 'blarg'), '<div></div>'