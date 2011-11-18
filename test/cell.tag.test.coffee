define [
  './util/helpers'
], ({nodeHTMLEquals})->

  testTag = (tag, expectedElHTML)->
    NewCell = cell.extend {tag}
    node = (new NewCell()).el
    nodeHTMLEquals node, expectedElHTML

  'undefined, null, <array> or <number> defaults to <div>': ->
    for invalid in [undefined, null, [], 5]
      testTag invalid, "<div></div>"

  'Bad Tag String defaults to <div>': ->
    testTag 'blarg', '<div></div>'

  'Tag String <p data-custom="myAttr" class="myClass" id="myId">': ->
    testTag '<p data-custom="myAttr" class="myClass" id="myId">',
      '<p class="myClass" data-custom="myAttr" id="myId"></p>'

  'Tag Function (-> <p data-custom="myAttr" class="myClass" id="myId">)': ->
    testTag (-> '<p data-custom="myAttr" class="myClass" id="myId">'),
      '<p class="myClass" data-custom="myAttr" id="myId"></p>'

  'Bad Tag Function': ->
    testTag (-> 'blarg'), '<div></div>'