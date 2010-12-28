getFlagIndex = (flags...) ->
   for i in [0..process.argv.length-1] when (flags.some (f) -> "-#{f}" == process.argv[i])
      return i+1
   return -1

module.exports =
   isFlag: (str) -> str[0] == '-'

   hasFlag: (flags...) ->
      (getFlagIndex.apply undefined, flags) != -1

   getFlagArg: (flags...) ->
      process.argv[getFlagIndex.apply(undefined,flags)]

