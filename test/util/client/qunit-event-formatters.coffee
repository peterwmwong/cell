S = (s) -> s or ""

doDefine = ->
   start: ->
   done: ({pass,fail})->
      """
      ==================================================
      [ FAIL: #{fail}  PASS: #{pass} ]
      ==================================================

      """
   'suite.start': ({suite}) ->
      """
        --------------------------------------------------
        #{suite}
        --------------------------------------------------
      """
   'suite.done': ({suite,pass,fail}) ->
      """
        --------------------------------------------------
        [ FAIL: #{fail}  PASS: #{pass} ]
        --------------------------------------------------

      """
   'test.start': ({suite,test}) ->
      "\n  #{test.replace(/\n/g,'\n  ')}"
   'test.done': ({suite,test}) ->
   'test.assert': ({suite,test,assert,isPass,expected,actual}) ->
      "    X #{S assert}  #{S(expected and "\n      Expected: #{expected}\n      Actual:   #{actual}")}" unless isPass

# Browser
if define?
   define doDefine

# Node
else
   module.exports = doDefine()
