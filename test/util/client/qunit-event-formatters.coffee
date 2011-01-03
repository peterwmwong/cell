doDefine = ->
   start: -> "----------------------------------------"
   done: ({pass,fail})->
      """
      ----------------------------------------
      [ FAIL: #{fail}  PASS: #{pass} ]
      """
   'suite.start': ({suite}) -> suite
   'suite.done': ({suite,pass,fail}) -> "#{suite} [ FAIL: #{fail}  PASS: #{pass} ]"
   'test.start': ({suite,test}) -> undefined
   'test.done': ({suite,test}) -> undefined
   'test.assert': ({suite,test,assert,isPass}) ->
      unless isPass
         ">>> FAIL <<< #{suite} | #{test} | #{assert}"
      else
         undefined

# Browser
if define?
   define doDefine

# Node
else
   module.exports = doDefine()
