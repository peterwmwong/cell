S = (s) -> s or ""

doDefine = ->
   start: ->
   done: ({pass,fail})->
      """
      ==================================================
      FAIL: #{fail}  PASS: #{pass}
      ==================================================
      """
   'test.start': ({test:{name}}) ->
      """
        --------------------------------------------------
        -> #{name}
      """
   'test.done': ({test,pass,fail}) ->
      """
        <- #{test}  FAIL: #{fail}  PASS: #{pass}
        --------------------------------------------------

      """
   'test.assert': ({suite,test:{name},assert,isPass,expected,actual}) ->
      "    X #{S assert}  #{S(expected and "\n      Expected: #{expected}\n      Actual:   #{actual}")}" unless isPass

# Browser
if define?
   define doDefine

# Node
else
   module.exports = doDefine()
