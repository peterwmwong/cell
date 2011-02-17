define ->
   waitdo: (delay,f)-> setTimeout f,delay
   jstest: (f)-> (require,get,done)-> get ->
      f (new Function(@testName))(), done

   
